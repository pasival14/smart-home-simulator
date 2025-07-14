import React from 'react';
import type { Scene } from '../types';

interface SceneSectionProps {
  scenes: Scene[];
  onActivateScene: (sceneId: string) => void;
}

const SceneSection: React.FC<SceneSectionProps> = ({ scenes, onActivateScene }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Scenes</h2>
      <div className="flex space-x-2">
        {scenes.map(scene => (
          <button
            key={scene.id}
            onClick={() => onActivateScene(scene.id)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            {scene.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SceneSection;