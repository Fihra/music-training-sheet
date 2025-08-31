'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import VexFlow from 'vexflow';
import styles from "../page.module.css";

interface Note {
    noteValue: string;
    rhythmValue: string;
    isExtraNatural: boolean;
}

interface NoteProps {
    sheet_tones: Note[][];
    musicSheetID: number | null;
}

const NoteSequence = ({sheet_tones, musicSheetID} : NoteProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState<Note[][]>([]);
    const [playbackNotes, setPlaybackNotes] = useState<(Note | null)[]>();
    const containerRef = useRef<HTMLDivElement | null>(null);
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
                    rhythmValue: "8n"
                }
                myPlaybackNotes.push(newPlayNote);
                myPlaybackNotes.push(null);
            }
        }
        setPlaybackNotes(myPlaybackNotes);
    }, [notes])

    const getSheetMusicNote = (n) => {
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

        const renderer = new VexFlow.Renderer(containerRef.current, VexFlow.Renderer.Backends.SVG);
        renderer.resize(1200, 200);
        
        const context = renderer.getContext();
        
        // context.clear();
        context.save();
        // context.setFillStyle("white");
        // context.setStrokeStyle("white");

        const stave = new VexFlow.Stave(10, 40, 500);
        stave.addClef('treble').addTimeSignature('4/4');
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

        //test stave2 / 2nd measure
        // const notes2 = [
        //     new VexFlow.StaveNote({ keys: ["g/4"], duration: "q" }),
        //     new VexFlow.StaveNote({ keys: ["a/4"], duration: "q" }),
        //     new VexFlow.StaveNote({ keys: ["b/4"], duration: "q" }),
        //     new VexFlow.StaveNote({ keys: ["c/5"], duration: "q" }),
        // ]
        
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

        // const barline = new Barline('end');
        // barline.setContext(context).setStave(stave);
        // barline.setX(stave.getWidth());
        // barline.draw();
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

    const playSound = () => {
        setIsPlaying( (prev) => {
            const newIsPlaying = !prev;

            if(newIsPlaying){
            Tone.start().then(() => {
                if(sequence){
                    Tone.Transport.stop();
                    Tone.Transport.position = 0;

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


    return(
        <div className={styles.musicContainer}>
            <div ref={containerRef}/>
            <button className={styles.cta} onClick={playSound}>{isPlaying ? "Stop": "Play"}</button>
            {musicSheetID && <button className={styles.cta} onClick={deleteSequence}>Delete</button>}
        </div>
    )
}

export default NoteSequence;