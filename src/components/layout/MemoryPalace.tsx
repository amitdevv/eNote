// ✅ FILE: /components/RoomCanvas.tsx

'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'sonner';
import { X, File,Circle,Dot } from 'lucide-react';
import { Button } from '../ui/button';
// import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

type Note = {
  title: string;
  link: string;
};

type StaticOrbProps = {
  position: [number, number, number];
  onClick: () => void;
  hasNotes: boolean;
};

type NoteModalProps = {
  hotspotId: number;
  onClose: () => void;
  userEmail: string | null;
  refreshHotspots: () => Promise<void>;
};

const hotspotPositions: [number, number, number][] = [
  [0, 0.8, -0.3],
  [2.2, 1, -1.6],
  [-0.2, 1.4, -1.3],
  [2.2, 1.5, 1.3],
  [-1.9, 2.1, -1.5],
  [-1.9, 3.8, -0.1],
];

export default function RoomCanvas() {
  const navigate=useNavigate()
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [hotspotWithNotes, setHotspotWithNotes] = useState<number[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUser, setcurrentUser]=useState<object | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      user?.user_metadata.avatar_url
      setcurrentUser(user);
    };
    getUser();
  }, []);

  const fetchNoteHotspots = async () => {
    if (!userEmail) return;
    const { data, error } = await supabase
      .from('memorynotes')
      .select('hotspot_id')
      .eq('user_email', userEmail);
    if (!error && data) {
      const uniqueHotspots = [...new Set(data.map((d: { hotspot_id: number }) => d.hotspot_id))];
      setHotspotWithNotes(uniqueHotspots);
    }
  };

  useEffect(() => {
    fetchNoteHotspots();
  }, [userEmail]);

  return (
  <div className="flex flex-col bg-neutral-950 min-h-screen w-full">
    <Toaster />

    {/* Top Navbar */}
    <div className="flex w-[90%] max-w-7xl mx-auto justify-between items-center py-4 text-white">
      <div className="flex items-center gap-2 text-xl cursor-pointer"onClick={()=>{
          navigate('/notes')
        }}>
        <div className="w-8 h-8 bg-green-500 flex justify-center items-center rounded ">
          <File className="text-3xl" />
        </div>
        <strong >eNote</strong>
      </div>
      <div className="flex gap-2 items-center">
        <Button onClick={() => navigate('/notes')} variant="secondary">
          Dashboard
        </Button>
      </div>
    </div>

    {/* Title Text */}
    <div
      className="text-center text-lg font-semibold mb-2 text-md p-4 text-green-500"
      id="memopal"
    >
      {">"} Welcome to the Memory Palace {"<"}
    </div>

    {/* Canvas + Description Section */}
    <div className="w-[95%] max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 rounded-lg text-white">
      
      {/* Canvas Section */}
      <div className="w-full lg:w-[70%] bg-white/90 rounded h-[70vh] sm:h-[75vh] md:h-[80vh] overflow-hidden">
        <Canvas
          shadows={false}
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 2, 5], fov: 60 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.7} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={6}
            target={[0, 1.5, 0]}
          />

          <RoomModel />

          {hotspotPositions.map((pos, idx) => (
            <StaticOrb
              key={idx}
              position={pos}
              onClick={() => setActiveHotspot(idx)}
              hasNotes={hotspotWithNotes.includes(idx)}
            />
          ))}

          {activeHotspot !== null && (
            <Html center>
              <NoteModal
                hotspotId={activeHotspot}
                userEmail={userEmail}
                onClose={() => setActiveHotspot(null)}
                refreshHotspots={fetchNoteHotspots}
              />
            </Html>
          )}
        </Canvas>
      </div>

      {/* Description Panel */}
      <div className="w-full lg:w-[30%] bg-neutral-950 p-4 flex flex-col justify-between gap-4 text-sm text-gray-300">
        <div className="flex flex-col gap-4">
          <div className="text-white text-xl font-semibold text-center">
            Turn your ideas into landmarks.
          </div>
          <p className="text-sm text-gray-400 leading-relaxed text-justify">
            The Memory Palace is a powerful method where you organize thoughts visually in a 3D space.
            Instead of plain lists, you place ideas on objects around a room—making them easier to remember and explore. It's like walking through your own mind.
          </p>

          {/* 3 Points */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2 items-start">
              <Dot className="text-cyan-500 mt-1" />
              <span>Organize ideas spatially for stronger memory recall</span>
            </div>
            <div className="flex gap-2 items-start">
              <Dot className="text-amber-500 mt-1" />
              <span>Interact with notes placed on real 3D objects</span>
            </div>
            <div className="flex gap-2 items-start">
              <Dot className="text-violet-500 mt-1" />
              <span>Experience thought like exploring a virtual room</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 mt-2">
          <p>* Scroll to zoom, click and drag to rotate the view</p>
          <p>* Click glowing circles on objects to add new notes</p>
        </div>
      </div>
    </div>
    <div className="text-center text-white p-4"></div>






  </div>
);

}

function RoomModel() {
  const { scene } = useGLTF('/models/room.glb');

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.frustumCulled = false;
      }
    });
  }, [scene]);

  const room = new THREE.Group();
  room.add(scene);
  room.position.set(0, 0, 0);
  room.scale.set(1.7, 1.7, 1.7);

  return <primitive object={room} />;
}

function StaticOrb({ position, onClick, hasNotes }: StaticOrbProps) {
  return (
    <mesh position={position} onClick={onClick}>
      <sphereGeometry args={[0.13, 32, 32]} />
      <meshStandardMaterial
        color={hasNotes ? '#800080' : '#22c55e'}
        // emissive={hasNotes ? '#9932CC' : '#22ce'}
        emissiveIntensity={2}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function NoteModal({ hotspotId, onClose, userEmail, refreshHotspots }: NoteModalProps) {
  const [notes, setNotes] = useState<Note[]>([{ title: '', link: '' }]);

  useEffect(() => {
    async function loadNotes() {
      if (!userEmail) return;
      const { data } = await supabase
        .from('memorynotes')
        .select('*')
        .eq('hotspot_id', hotspotId)
        .eq('user_email', userEmail);
      if (data && data.length > 0) setNotes(data);
    }
    loadNotes();
  }, [hotspotId, userEmail]);

  const updateNote = (i: number, field: keyof Note, value: string) => {
    const updated = [...notes];
    updated[i][field] = value;
    setNotes(updated);
  };

  const addNote = () => {
    setNotes([...notes, { title: '', link: '' }]);
  };

  const deleteNote = (index: number) => {
    const updated = [...notes];
    updated.splice(index, 1);
    setNotes(updated);
  };

  const saveNotes = async () => {
    if (!userEmail) return;
    await supabase
      .from('memorynotes')
      .delete()
      .eq('hotspot_id', hotspotId)
      .eq('user_email', userEmail);
    await Promise.all(
      notes.map((note) =>
        supabase.from('memorynotes').insert({
          ...note,
          hotspot_id: hotspotId,
          user_email: userEmail,
        })
      )
    );
    await refreshHotspots();
   toast.success('Notes saved successfully!', {
  style: {
    background: 'rgba(34,197,94,0.15)',       // glassy green bg
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(34,197,94,0.4)',   // green border
    color: '#166534',                          // dark green text
    // boxShadow: '0 4px 12px rgba(34,197,94,0.2)',
    
  },

});
    onClose();
  };

  const labelMap: Record<number, string> = {
    0: 'Chair',
    1: 'Pillow',
    2: 'Table',
    3: 'Radio',
    4: 'TV',
    5: 'Game Console',
  };

return (
  <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 space-y-5 text-gray-800 sm:text-sm text-xs border border-gray-200 mx-auto">
    <h2 className="text-lg sm:text-xl font-semibold border-b pb-2">
      Notes for <span className="text-indigo-600">{labelMap[hotspotId]}</span>
    </h2>

    <div className="space-y-4 max-h-40 overflow-y-auto pr-1">
      {notes.map((note, i) => (
        <div
          key={i}
          className="relative bg-gray-50 border border-gray-300 rounded-xl p-3 flex flex-col gap-2"
        >
          <button
            onClick={() => deleteNote(i)}
            className="absolute top-0.5 right-0.5 text-gray-400 hover:text-red-500 transition"
          >
            <X size={14} />
          </button>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            placeholder="Title"
            value={note.title}
            onChange={(e) => updateNote(i, 'title', e.target.value)}
          />
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            placeholder="Link"
            value={note.link}
            onChange={(e) => updateNote(i, 'link', e.target.value)}
          />
        </div>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t pt-4">
      <button
        onClick={addNote}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-full w-full sm:w-auto text-center"
      >
        + Add Note
      </button>
      <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <button
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs px-4 py-2 rounded-md w-full sm:w-auto"
        >
          Cancel
        </button>
        <button
          onClick={saveNotes}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-md w-full sm:w-auto"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);


}