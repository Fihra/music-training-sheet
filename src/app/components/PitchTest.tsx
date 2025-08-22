'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { useSession } from 'next-auth/react';
import NoteSequence from './NoteSequence';

const pitches = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const PitchTest = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState(["C4", "Bb4", "E4", "G4", "E4", "B4", "F4", "A4"]);
    const { data: session } = useSession();

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
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(note, "8n", time);
        }, notes, "8n");
            
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
        }

        return newIsPlaying;
        })        
    }

    const addSequence = async () => {
        const noteSequence = notes;
        if(!session?.user) return;

        const res = await fetch('/api/musicsheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({musicSheet: noteSequence, user_id: session.user.user_id})
        })
    }

    return(
        <div>
            <h2>Pitch Testing</h2>
            <button onClick={playSound}>{isPlaying ? "Stop": "Play"}</button>
            <button onClick={randomizeNotes}>Generate Sequence</button>
            <NoteSequence sheet_tones={notes}/>
            {session && <button onClick={addSequence}>Add to list</button>}

        </div>
    )
}

export default PitchTest;