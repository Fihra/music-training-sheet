'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import NoteSequence from './NoteSequence';
import styles from "../page.module.css";

const pitches = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const PitchTest = () => {
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
        <div className={styles.generateContainer}>
            <h2>Pitch Testing</h2>
            <button className={styles.cta} onClick={randomizeNotes}>Generate Sequence</button>
            <NoteSequence sheet_tones={notes} musicSheetID={null}/>
            {session && <button className={styles.cta} onClick={addSequence}>Add to list</button>}

        </div>
    )
}

export default PitchTest;