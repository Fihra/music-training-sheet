'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import VexFlow from 'vexflow';
import styles from "../page.module.css";

interface Note {
    noteValue: string;
    rhythmValue: string;
}

interface NoteProps {
    sheet_tones: Note[];
    musicSheetID: number | null;
}

const NoteSequence = ({sheet_tones, musicSheetID} : NoteProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState<string[]>([]);
    const [playbackNotes, setPlaybackNotes] = useState();
    const containerRef = useRef<HTMLDivElement | null>(null);

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
        setPlaybackNotes(sheet_tones);
    }, []);

    useEffect(() => {
        if(!containerRef.current) return;
        containerRef.current.innerHTML = '';
        
        setNotes(sheet_tones);
    }, [sheet_tones])

    useEffect(() => {
        let myPlaybackNotes = [];
        
        if(!notes || notes.length === 0) return;

        for(let i = 0; i < notes.length; i++) {

            if(notes[i].rhythmValue === "8n"){
                myPlaybackNotes.push(notes[i]);
            }

            else if(notes[i].rhythmValue === "q"){
                const newPlayNote = {
                    noteValue: notes[i].noteValue,
                    rhythmValue: "8n"
                }
                myPlaybackNotes.push(newPlayNote);
                myPlaybackNotes.push(null);
            }
            
            console.log("show me the note: ", notes[i]);
        }
        console.log(myPlaybackNotes);
        setPlaybackNotes(myPlaybackNotes);
    }, [notes])

    useEffect(() => {
        if(notes.length === 0) return;
        if(!containerRef.current) return;

        const { Barline } = VexFlow;

        const renderer = new VexFlow.Renderer(containerRef.current, VexFlow.Renderer.Backends.SVG);
        renderer.resize(500, 200);
        
        const context = renderer.getContext();
        
        // context.clear();
        context.save();
        // context.setFillStyle("white");
        // context.setStrokeStyle("white");

        const stave = new VexFlow.Stave(10, 40, 500);
        stave.addClef('treble').addTimeSignature('4/4');
        stave.setContext(context).draw();

        // const vexNotes = [
        //     new VexFlow.StaveNote({ keys: ['c/4'], duration: 'q'}),
        //     new VexFlow.StaveNote({ keys: ['d/4'], duration: 'q'}),
        //     new VexFlow.StaveNote({ keys: ['e/4'], duration: 'q'}),
        //     new VexFlow.StaveNote({ keys: ['f/4'], duration: 'q'}),
        // ];
        console.log("NoteSEquence: ", notes);

        const vexNotes = notes.map((n) => {
            const splitNote = n.noteValue.split('');
            const currentOctave = splitNote[splitNote.length - 1];
            const mainNote = splitNote.splice(0, splitNote.length-1).join('');

            if(mainNote.length < 2){
                return new VexFlow.StaveNote({ keys: [`${mainNote}/${currentOctave}`], duration: n.rhythmValue});
            }
            return new VexFlow.StaveNote({ keys: [`${mainNote[0]}/${currentOctave}`], duration: n.rhythmValue}).addModifier(new VexFlow.Accidental(mainNote[1]));

        })
        
        const voice = new VexFlow.Voice({ numBeats: 4, beatValue: 4});
        voice.addTickables(vexNotes);

        const formatter = new VexFlow.Formatter();
        formatter.joinVoices([voice]).formatToStave([voice], stave);

        // new VexFlow.Formatter().joinVoices([voice]).format([voice], 400);
        // new VexFlow.Formatter().joinVoices([voice2]).format([voice2], 400);

        voice.draw(context, stave);

        const barline = new Barline('end');
        barline.setContext(context).setStave(stave);
        barline.setX(stave.getWidth());
        barline.draw();
        context.restore();
    }, [notes]);

    useEffect(() => {
            const seq = new Tone.Sequence((time, note) => {

            // console.log("note in sequence: ", note);
            // const synth = new Tone.PluckSynth().toDestination();
            if(note !== null) {
                const synth = new Tone.Synth().toDestination();
                synth.triggerAttackRelease(note.noteValue, "8n", time);
            }
            
        }, playbackNotes, "8n");
            
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
                    Tone.Transport.start();
                    sequence.start();

                    const duration = notes.length * 500;

                    setTimeout(() => {
                        setIsPlaying(false);
                        Tone.Transport.stop();
                        sequence.stop();
                    }, duration);
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