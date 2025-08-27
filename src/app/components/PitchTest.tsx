'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import NoteSequence from './NoteSequence';
import styles from "../page.module.css";

const pitches = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const PitchTest = () => {
    const [notes, setNotes] = useState([
        [
            {noteValue: "C4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "Bb4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "E4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "G4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "E4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "B4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "F4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "A4", rhythmValue: "8n", isExtraNatural: false}
        ],
        [
            {noteValue: "D4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "Bb4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "F4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "G4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "Bb4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "B4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "F4", rhythmValue: "8n", isExtraNatural: false},
            {noteValue: "G4", rhythmValue: "8n", isExtraNatural: false}
        ]
    ]);
    const { data: session } = useSession();

    const randomizeRhythm = () => {
        const randomNum = Math.floor(Math.random() * 10);
        return randomNum;
    }

    const randomizeNotes = () => {
        let newSetOfNotes = [];
        let currentSlotNum = 0;

        while(currentSlotNum < 8){
            const randomNum = pitches[Math.floor(Math.random() * pitches.length)];

            const newNote = {
                noteValue: '',
                rhythmValue: '',
                isExtraNatural: false
            };

            newNote.noteValue = `${randomNum}4`;

            if(randomizeRhythm() > 5){              
                newNote.rhythmValue = "8n";
                currentSlotNum+=1;
            } else {
                if(currentSlotNum === 7){
                    continue;
                }
                newNote.rhythmValue = "q";
                currentSlotNum+=2;
            }

            newSetOfNotes.push(newNote);
        }

        for(let i = 0; i < newSetOfNotes.length; i++) {
            let currentFlatNote;
            if(newSetOfNotes[i].noteValue[1].toLowerCase() === "b"){
                currentFlatNote = newSetOfNotes[i];
            }

            for(let j = i + 1; j < newSetOfNotes.length; j++){
                let currentNoteValue = currentFlatNote?.noteValue.slice(0, 2);
                if(currentNoteValue){
                    const splitNewNote = newSetOfNotes[j].noteValue.split(/\d+/)[0];
                    if(currentNoteValue === splitNewNote) break;

                    if((currentNoteValue[0] === splitNewNote[0]) && splitNewNote.length < 2){
                        newSetOfNotes[j].isExtraNatural = true;
                    }
                }                          
            }
        }

        currentSlotNum = 0;
        return newSetOfNotes;
    }

    const generateNoteCollection = () => {
        const outputCollection = [];
        outputCollection.push(randomizeNotes());
        outputCollection.push(randomizeNotes());
        setNotes(outputCollection);
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
            <button className={styles.cta} onClick={generateNoteCollection}>Generate Sequence</button>
            <NoteSequence sheet_tones={notes} musicSheetID={null}/>
            {session && <button className={styles.cta} onClick={addSequence}>Add to list</button>}

        </div>
    )
}

export default PitchTest;