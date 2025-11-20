
import React, { useState } from 'react';
import { FilterType, FrameColor, FontFamily, PolaroidConfig } from '../types';
import { Wand2, Upload, Download, RotateCw, Palette, Type, Image as ImageIcon, Sparkles, Sticker as StickerIcon, Undo2, Scan, Maximize, Music, Play, Pause, Trash2, Video } from 'lucide-react';

interface ControlsProps {
  config: PolaroidConfig;
  onUpdate: (updates: Partial<PolaroidConfig>) => void;
  onGenerateCaption: () => void;
  onGenerateEdit: (prompt: string) => void;
  onGenerateSticker: (prompt: string) => void;
  onGenerateMusic: () => void;
  onToggleMusic: () => void;
  isMusicPlaying: boolean;
  onRevertImage: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  hasOriginalImage: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  config, 
  onUpdate, 
  onGenerateCaption,
  onGenerateEdit,
  onGenerateSticker,
  onGenerateMusic,
  onToggleMusic,
  isMusicPlaying,
  onRevertImage,
  onDownload,
  isGenerating,
  hasOriginalImage
}) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [stickerPrompt, setStickerPrompt] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      
      if (isVideo) {
        const url = URL.createObjectURL(file);
        onUpdate({ image: url, mediaType: 'video' });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpdate({ image: reader.result as string, mediaType: 'image' });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        onUpdate({
            music: {
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'My Upload',
                mood: 'chill',
                tempo: 100,
                source: 'upload',
                url: url
            }
        });
    }
  };

  const isVideoMode = config.mediaType === 'video' || config.music !== null;

  return (
    <div className="w-full lg:w-96 bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RetroSnap</h1>
        <p className="text-zinc-500 text-sm mt-1">Create your digital memory</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        
        {/* Upload Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Upload size={14} />
                Source Media
              </label>
              <div className="flex bg-zinc-800 rounded-md p-0.5">
                  <button 
                    onClick={() => onUpdate({ imageFit: 'cover' })}
                    className={`p-1.5 rounded-sm transition-all ${config.imageFit === 'cover' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                    title="Fill Frame (Crop)"
                  >
                      <Scan size={14} />
                  </button>
                  <button 
                    onClick={() => onUpdate({ imageFit: 'contain' })}
                    className={`p-1.5 rounded-sm transition-all ${config.imageFit === 'contain' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                    title="Fit Entire Image"
                  >
                      <Maximize size={14} />
                  </button>
              </div>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 transition-colors hover:border-zinc-500 group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {config.mediaType === 'video' ? <Video className="text-zinc-400 mb-2" /> : <ImageIcon className="text-zinc-400 mb-2" />}
              <p className="text-sm text-zinc-400 group-hover:text-zinc-200">Upload Photo or Video</p>
            </div>
            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
          </label>
        </div>

        {/* AI Studio */}
        <div className="space-y-4 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} />
                AI Studio
            </label>
            
            {/* Magic Edit - Only for Images */}
            {config.mediaType === 'image' ? (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder="E.g., Make it sketch style..."
                            className="flex-1 bg-zinc-900 border border-indigo-500/30 rounded p-2 text-xs text-zinc-200 focus:border-indigo-500 outline-none"
                        />
                        <button
                            onClick={() => onGenerateEdit(editPrompt)}
                            disabled={!config.image || isGenerating || !editPrompt}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2 rounded transition-colors"
                            title="Magic Edit"
                        >
                            <Wand2 size={14} />
                        </button>
                    </div>
                    {hasOriginalImage && (
                        <button 
                            onClick={onRevertImage}
                            className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 w-full justify-end"
                        >
                            <Undo2 size={12} /> Revert to Original
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-xs text-zinc-500 italic">Magic Edit not available for videos.</div>
            )}

            {/* Sticker Gen */}
            <div className="space-y-2 pt-2 border-t border-indigo-500/20">
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={stickerPrompt}
                        onChange={(e) => setStickerPrompt(e.target.value)}
                        placeholder="E.g., Cute coffee cup..."
                        className="flex-1 bg-zinc-900 border border-indigo-500/30 rounded p-2 text-xs text-zinc-200 focus:border-indigo-500 outline-none"
                    />
                    <button
                        onClick={() => {
                            onGenerateSticker(stickerPrompt);
                            setStickerPrompt('');
                        }}
                        disabled={isGenerating || !stickerPrompt}
                        className="bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2 rounded transition-colors"
                        title="Add Sticker"
                    >
                        <StickerIcon size={14} />
                    </button>
                </div>
                {config.stickers.length > 0 && (
                    <button 
                        onClick={() => onUpdate({ stickers: [] })}
                        className="text-xs text-zinc-500 hover:text-zinc-300 w-full text-right block"
                    >
                        Clear Stickers
                    </button>
                )}
            </div>
        </div>

        {/* Music Studio */}
        <div className="space-y-4 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
             <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Music size={14} />
                Music Studio
            </label>

            {!config.music ? (
                 <div className="flex gap-2">
                    <button
                        onClick={onGenerateMusic}
                        disabled={!config.image || isGenerating}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white p-2 rounded text-xs flex items-center justify-center gap-2"
                    >
                        <Sparkles size={12} />
                        Generate Vibe
                    </button>
                    <label className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded text-xs flex items-center justify-center gap-2 cursor-pointer">
                        <Upload size={12} />
                        Upload MP3
                        <input type="file" className="hidden" accept="audio/*" onChange={handleMusicUpload} />
                    </label>
                 </div>
            ) : (
                <div className="space-y-3">
                    <div className="bg-zinc-800 rounded p-3 flex items-center justify-between">
                         <div className="overflow-hidden">
                             <div className="text-xs font-bold text-white truncate">{config.music.title}</div>
                             <div className="text-[10px] text-zinc-400 truncate">{config.music.artist}</div>
                         </div>
                         <div className="flex items-center gap-2">
                             <button onClick={onToggleMusic} className="text-white hover:text-emerald-400">
                                 {isMusicPlaying ? <Pause size={16} /> : <Play size={16} />}
                             </button>
                             <button onClick={() => onUpdate({ music: null })} className="text-zinc-500 hover:text-red-400">
                                 <Trash2 size={14} />
                             </button>
                         </div>
                    </div>
                    {config.music.source === 'generated' && (
                        <div className="text-[10px] text-emerald-400/70 flex justify-between px-1">
                            <span>Mood: {config.music.mood}</span>
                            <span>Tempo: {config.music.tempo} BPM</span>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Style Controls */}
        <div className="space-y-4">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Palette size={14} />
                Frame Style
            </label>
            
            <div className="grid grid-cols-5 gap-2">
                {Object.values(FrameColor).map((color) => (
                    <button
                        key={color}
                        onClick={() => onUpdate({ frameColor: color })}
                        className={`w-full aspect-square rounded-md border-2 transition-all ${config.frameColor === color ? 'border-indigo-500 scale-110' : 'border-transparent hover:border-zinc-600'}`}
                    >
                        <div className={`w-full h-full rounded-sm shadow-sm ${color === FrameColor.Black ? 'bg-neutral-900' : color.replace('bg-polaroid-', 'bg-') // Mapping tailwind classes to approximate visualization
                        } ${color === FrameColor.White ? 'bg-zinc-100' : ''}
                        ${color === FrameColor.Cream ? 'bg-[#fdfbf7]' : ''}
                        ${color === FrameColor.Pink ? 'bg-red-100' : ''}
                        ${color === FrameColor.Blue ? 'bg-blue-100' : ''}
                        `}></div>
                    </button>
                ))}
            </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
             <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} />
                Vintage Filters
            </label>
            <div className="grid grid-cols-3 gap-2">
                {Object.entries(FilterType).map(([name, value]) => (
                    <button
                        key={name}
                        onClick={() => onUpdate({ filter: value })}
                        className={`px-3 py-2 text-xs rounded-md border transition-all ${config.filter === value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        {name}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-4 pt-2">
                 <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={config.showTexture}
                        onChange={(e) => onUpdate({ showTexture: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    Texture
                </label>
                 <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={config.showTape}
                        onChange={(e) => onUpdate({ showTape: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    Tape
                </label>
            </div>
        </div>

        {/* Caption & Font */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Type size={14} />
                    Caption
                </label>
                <button 
                    onClick={onGenerateCaption}
                    disabled={!config.image || isGenerating}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                >
                    <Wand2 size={12} />
                    Caption
                </button>
            </div>
            
            <textarea 
                value={config.caption}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                placeholder="Write a memory..."
                className={`w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-20 ${config.font}`}
            />

            <div className="grid grid-cols-4 gap-2">
                 {Object.entries(FontFamily).map(([name, value]) => (
                    <button
                        key={name}
                        onClick={() => onUpdate({ font: value })}
                        className={`h-8 flex items-center justify-center rounded border transition-all ${value} text-lg ${config.font === value ? 'bg-indigo-900/50 border-indigo-500 text-indigo-200' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}`}
                        title={name}
                    >
                        Aa
                    </button>
                 ))}
            </div>
             <input 
                type="text"
                value={config.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
                placeholder="Date (e.g. '98)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-zinc-300 font-typewriter"
            />
        </div>

        {/* Rotation Slider */}
        <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <RotateCw size={14} />
                Rotation
            </label>
            <input 
                type="range" 
                min="-15" 
                max="15" 
                value={config.rotation} 
                onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>

      </div>

      <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
        <button 
            onClick={onDownload}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
        >
            <Download size={18} />
            {isVideoMode ? 'Save Video' : 'Save Photo'}
        </button>
      </div>
    </div>
  );
};
