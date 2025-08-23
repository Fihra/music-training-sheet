'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import VexFlow from 'vexflow';
import styles from "../page.module.css";

type Props = {
    sheet_tones: string[];
    musicSheetID: number | null;
}

const NoteSequence = ({sheet_tones, musicSheetID} : Props) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState<string[]>([]);
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
        if(!containerRef.current) return;
        containerRef.current.innerHTML = '';
        
        setNotes(sheet_tones);
    }, [sheet_tones])

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
        console.log(notes);

        const vexNotes = notes.map((n) => {
            const splitNote = n.split('');
            const currentOctave = splitNote[splitNote.length - 1];
            const mainNote = splitNote.splice(0, splitNote.length-1).join('');

            if(mainNote.length < 2){
                return new VexFlow.StaveNote({ keys: [`${mainNote}/${currentOctave}`], duration: '8n'});
            }
            return new VexFlow.StaveNote({ keys: [`${mainNote[0]}/${currentOctave}`], duration: '8n'}).addModifier(new VexFlow.Accidental(mainNote[1]));

            
        })
        
        const voice = new VexFlow.Voice({ numBeats: 4, beatValue: 4});
        voice.addTickables(vexNotes);
        
        new VexFlow.Formatter().joinVoices([voice]).format([voice], 400);

        voice.draw(context, stave);

        const barline = new Barline('end');
        barline.setContext(context).setStave(stave);
        barline.setX(stave.getWidth());
        barline.draw();
        context.restore();
    }, [notes]);

    useEffect(() => {
        const seq = new Tone.Sequence((time, note) => {
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(note, "4n", time);
        }, notes, "4n");
            
        setSequence(seq);

        return() => {
            seq.dispose();
            Tone.Transport.stop();
        };

    }, [notes]);
    
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
            <button onClick={playSound}>{isPlaying ? "Stop": "Play"}</button>
            {musicSheetID && <button onClick={deleteSequence}>Delete</button>}
        </div>
    )
}

export default NoteSequence;