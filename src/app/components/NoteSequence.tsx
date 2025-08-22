'use client';

import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import VexFlow from 'vexflow';

type Props = {
    sheet_tones: string[];
}

const NoteSequence = ({sheet_tones} : Props) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState<Tone.Sequence | null>(null);
    const [notes, setNotes] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    console.log("sheet tones: ", sheet_tones);

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

    return(
        <div ref={containerRef}/>
        // <div>
        //     <p>Music Sheet</p>
        // </div>
    )
}

export default NoteSequence;