'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';

const pitches = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const PitchTest = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState(["C4", "Bb4", "E4", "G4", "E4"]);

    console.log("num: ", Math.floor(Math.random() * 10));

    const randomizeNotes = () => {
        let newSetOfNotes = [];
        for(let i = 0; i < 8; i++){
            const randomNum = pitches[Math.floor(Math.random() * pitches.length)];
            const randomOctave = Math.floor(Math.random() * 5) + 1;
            const newNote = `${randomNum}4`;
            console.log(newNote);
            newSetOfNotes.push(newNote);
        }
        console.log(notes);
        setNotes(newSetOfNotes);
    }

    useEffect(() => {
        
        const seq = new Tone.Sequence((time, note) => {
            console.log("My Notes: ", notes);
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(note, "8n", time);
        }, notes, "4n");
            
        setSequence(seq);

        return() => {
            seq.dispose();
        };

    }, [notes]);

    const playSound = () => {
        setIsPlaying(!isPlaying);

        console.log("isPlaying: ", isPlaying);

        if(isPlaying){
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
        }
        
    }

    return(
        <div>
            <h2>Pitch Testing</h2>

            <button onClick={playSound}>{isPlaying ? "Play": "Stop"}</button>
            <button onClick={randomizeNotes}>Generate Sequence</button>
        </div>
    )
}

export default PitchTest;