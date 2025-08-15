'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import VexFlow from 'vexflow';

const pitches = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const PitchTest = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState(["C4", "Bb4", "E4", "G4", "E4", "B4", "F4", "A4"]);
    const [vexContainer, setVexContainer] = useState()
    const containerRef = useRef<HTMLDivElement | null>(null);

    const randomizeNotes = () => {
        if(!containerRef.current) return;
        containerRef.current.innerHTML = '';
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
        if(!containerRef.current) return;
        

        const renderer = new VexFlow.Renderer(containerRef.current, VexFlow.Renderer.Backends.SVG);
        renderer.resize(500, 200);
        
        const context = renderer.getContext();
        
        // context.clear();
        context.save();
        context.setFillStyle("white");
        context.setStrokeStyle("white");

        

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
        
        const formatter = new VexFlow.Formatter().joinVoices([voice]).format([voice], 400);

        voice.draw(context, stave);

        context.restore();
        

    }, [notes]);

    useEffect(() => {
        
        const seq = new Tone.Sequence((time, note) => {
            // console.log("My Notes: ", notes);
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
        setIsPlaying(!isPlaying);

        console.log("My Notes: ", notes);

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
            <div ref={containerRef}/>
            
        </div>
    )
}

export default PitchTest;