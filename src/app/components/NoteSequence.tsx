'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import VexFlow from 'vexflow';
import { jsPDF } from "jspdf";
import styles from "../page.module.css";

interface Note {
    noteValue: string;
    rhythmValue: string;
    isExtraNatural: boolean;
}

interface NoteProps {
    sheet_tones: Note[][];
    musicSheetID: number | null;
    keySig?: string;
    musicPrefs?: {
        quarterNotes: boolean;
        eighthNotes: boolean;
        currentKeySignature: string;
        timeSignature: string;
    };
}

const NoteSequence = ({sheet_tones, musicSheetID, musicPrefs, keySig} : NoteProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState<Note[][]>([]);
    const [playbackNotes, setPlaybackNotes] = useState<(Note | null)[]>();
    const containerRef = useRef<HTMLCanvasElement | null>(null);
    const synthRef = useRef<Tone.Synth | null>(null);

    const deleteSequence = async () => {
        console.log("delete this sequence: ", musicSheetID);
        try {
            const response = await fetch(`/api/musicsheets/${musicSheetID}`, {
                method: 'DELETE'
            });

            if(!response.ok){
                throw new Error("Failed to delete music sheet");
            }
            console.log("Music deleted successfully");
        } catch(error) {
            console.error("Error deleting music: ", error);
        }
    }

    useEffect(() => {       
        synthRef.current = new Tone.Synth().toDestination();
        
        return () => {
            synthRef.current?.dispose();
            synthRef.current = null;
        }
    }, []);

    useEffect(() => {
        if(!containerRef.current) return;
        containerRef.current.innerHTML = '';
        setNotes(sheet_tones);
    }, [sheet_tones])

    useEffect(() => {
        let myPlaybackNotes = [];
        
        if(!notes || notes.length === 0) return;

        const combinedNotes = [...notes[0], ...notes[1]];

        for(let i = 0; i < combinedNotes.length; i++) {
            if(combinedNotes[i].rhythmValue === "8n"){
                myPlaybackNotes.push(combinedNotes[i]);
            }

            else if(combinedNotes[i].rhythmValue === "q"){
                const newPlayNote = {
                    noteValue: combinedNotes[i].noteValue,
                    rhythmValue: "8n",
                    isExtraNatural: combinedNotes[i].isExtraNatural
                }
                myPlaybackNotes.push(newPlayNote);
                myPlaybackNotes.push(null);
            }
        }

        setPlaybackNotes(myPlaybackNotes);
    }, [notes])

    const getSheetMusicNote = (n: Note) => {
        const splitNote = n.noteValue.split('');
        const currentOctave = splitNote[splitNote.length - 1];
        const mainNote = splitNote.splice(0, splitNote.length-1).join('');

        if(n.isExtraNatural){
            return new VexFlow.StaveNote({ keys: [`${mainNote[0]}/${currentOctave}`], duration: n.rhythmValue}).addModifier(new VexFlow.Accidental("n"));
        }

        if(mainNote.length < 2){
            return new VexFlow.StaveNote({ keys: [`${mainNote}/${currentOctave}`], duration: n.rhythmValue});
        }

        return new VexFlow.StaveNote({ keys: [`${mainNote[0]}/${currentOctave}`], duration: n.rhythmValue}).addModifier(new VexFlow.Accidental(mainNote[1]));
    }

    useEffect(() => {
        if(notes.length === 0) return;
        if(!containerRef.current) return;

        const { Barline } = VexFlow;

        const renderer = new VexFlow.Renderer(containerRef.current, VexFlow.Renderer.Backends.CANVAS);
        renderer.resize(1200, 200);
        
        const context = renderer.getContext();
        
        context.save();

        const stave = new VexFlow.Stave(10, 40, 500);
        stave.addClef('treble').addTimeSignature('4/4');
        stave.addKeySignature(
            (musicPrefs?.currentKeySignature && musicPrefs.currentKeySignature !== "C") || keySig !== "C"
                ? keySig ?? musicPrefs?.currentKeySignature ?? "C"
                : "C"
        );


        stave.setEndBarType(Barline.type.SINGLE);
        stave.setContext(context).draw();

        const stave2 = new VexFlow.Stave(stave.width + stave.getX(), 40, 500);
        stave2.setBegBarType(Barline.type.SINGLE);
        stave2.setEndBarType(Barline.type.END);
        stave2.setContext(context).draw();

        const vexNotes = notes[0].map((n) => {
            return getSheetMusicNote(n);
        })
        const notes2 = notes[1].map((n) => {
            return getSheetMusicNote(n);
        })
    
        const voice = new VexFlow.Voice({ numBeats: 4, beatValue: 4});
        voice.addTickables(vexNotes);

        const voice2 = new VexFlow.Voice({ numBeats: 4, beatValue: 4});
        voice2.addTickables(notes2);

        // const formatter = new VexFlow.Formatter();
        // formatter.joinVoices([voice]).formatToStave([voice], stave);

        // voice.draw(context, stave);

        new VexFlow.Formatter().joinVoices([voice]).formatToStave([voice], stave)
        new VexFlow.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

        voice.draw(context, stave);
        voice2.draw(context, stave2);

        context.restore();
    }, [notes]);

    useEffect(() => {
        if(!playbackNotes || playbackNotes.length === 0) return;
        
        const seq = new Tone.Sequence((time, note) => {
            if(note !== null) {
                synthRef.current?.triggerAttackRelease(note.noteValue, "8n", time);
            }
            
        }, playbackNotes, "8n");
            
        seq.loop = false;
        setSequence(seq);

        return() => {
            seq.dispose();
            Tone.Transport.stop();
        };

    }, [playbackNotes]);

    const getSequenceDuration = () => {
        let totalDuration = 0;

        sequence?.events.forEach((event) => {
            let tempRhythm = event?.rhythmValue ?? "8n";
            const duration = Tone.Time(tempRhythm).toSeconds();
            totalDuration += duration;
        })
        return totalDuration;
    }

    const handleRecord = async () => {
        const recorder = new Tone.Recorder();

        if(synthRef.current){
            const synth = synthRef.current;

            synth.disconnect();
            synth.connect(recorder);

            await recorder.start();
            Tone.Transport.start();
            sequence?.start();

            Tone.Transport.once('stop', async () => {
                const buffer = await recorder.stop();

                synth.disconnect(recorder);
                synth.toDestination();

                const oggBlob = new Blob([buffer], {type: "audio/ogg"});
                const url = URL.createObjectURL(oggBlob);
                const downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = "sequence.ogg";
                downloadLink.click();
                URL.revokeObjectURL(url);
            } )

            setTimeout(() => {
                Tone.Transport.stop();
            }, getSequenceDuration() * 1500)

        }       
    }

    const playSound = () => {
        setIsPlaying( (prev) => {
            const newIsPlaying = !prev;

            if(newIsPlaying){
            Tone.start().then(() => {
                if(sequence){
                    Tone.Transport.stop();
                    Tone.Transport.cancel();
                    Tone.Transport.position = 0;

                    sequence.stop();
                    sequence.start(0);
                    Tone.Transport.start();

                    // const duration = notes.length * 500;
                    const steps = sequence.length;
                    const stepDuration = Tone.Time("8n").toSeconds();
                    const stopTime = steps * stepDuration;

                    Tone.Transport.scheduleOnce(() => {
                        setIsPlaying(false);
                        Tone.Transport.stop();
                        sequence.stop();
                    }, `+${stopTime}`)
                }
            }).catch(error => {
                console.log("Error starting ToneJS: ", error);
            })
        } else {
            sequence?.stop();
            Tone.Transport.stop();
        }

        return newIsPlaying;
        })        
    }

    const handlePDF = () => {
        const canvas = containerRef.current;

        if(canvas) {

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Desired width in PDF (in mm)
            const pdfWidth = 180; // mm (you can adjust this as needed)
            
            // Convert canvas pixels to mm based on 96 DPI (standard browser DPI)
            const pxToMm = 25.4 / 96;  // 25.4mm = 1 inch, 96 DPI = 96 pixels per inch

            const canvasWidthInMm = canvasWidth * pxToMm;  // Convert to mm
            const canvasHeightInMm = canvasHeight * pxToMm;  // Convert to mm

            // Calculate the scaling factor for the PDF
            const scaleFactor = pdfWidth / canvasWidthInMm;
            const pdfHeight = canvasHeightInMm * scaleFactor;

            // Create the PDF
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL("image/png");
            // Add the image to the PDF with the calculated dimensions
            pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);


                
                // pdf.addImage(imgData, "PDF", 2, 2, 200, 100);
                pdf.save("sheet_music.pdf");
            }
    }


    return(
        <div className={styles.musicContainer}>
            <canvas ref={containerRef}/>
            <div className={styles.dashboardButtons}>
                <button className={styles.playCta} onClick={playSound}>{isPlaying ? "Stop": "Play"}</button>
                {musicSheetID && <button className={styles.deleteCta} onClick={deleteSequence}>Delete</button>}
                <button className={styles.cta} onClick={handleRecord}>
                    Export Audio (OGG)
                </button>
                <button className={styles.exportCta} onClick={handlePDF}>
                    Export PDF
                </button>
            </div>
        </div>
    )
}

export default NoteSequence;