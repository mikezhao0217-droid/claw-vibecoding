'use client';

import React, { useState } from 'react';

interface DefaultMilestonesEditorProps {
  defaultMilestones: any[];
  onUpdate: (milestones: any[]) => void;
  isEditing: boolean;
}

const DefaultMilestonesEditor: React.FC<DefaultMilestonesEditorProps> = ({ 
  defaultMilestones = [], 
  onUpdate, 
  isEditing 
}) => {
  const [newMilestone, setNewMilestone] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const addMilestone = () => {
    if (newMilestone.trim()) {
      const updatedMilestones = [
        ...defaultMilestones,
        {
          id: `dm-${Date.now()}`,
          name: newMilestone.trim(),
          completed: false
        }
      ];
      onUpdate(updatedMilestones);
      setNewMilestone('');
    }
  };

  const deleteMilestone = (index: number) => {
    const updatedMilestones = defaultMilestones.filter((_, i) => i !== index);
    onUpdate(updatedMilestones);
  };

  const startEditing = (index: number, name: string) => {
    setEditingIndex(index);
    setEditingText(name);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const updatedMilestones = [...defaultMilestones];
      updatedMilestones[editingIndex] = {
        ...updatedMilestones[editingIndex],
        name: editingText
      };
      onUpdate(updatedMilestones);
      setEditingIndex(null);
      setEditingText('');
    }
  };

  const moveMilestone = (fromIndex: number, toIndex: number) => {
    const updatedMilestones = [...defaultMilestones];
    const [movedItem] = updatedMilestones.splice(fromIndex, 1);
    updatedMilestones.splice(toIndex, 0, movedItem);
    onUpdate(updatedMilestones);
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveMilestone(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < defaultMilestones.length - 1) {
      moveMilestone(index, index + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">默认里程碑模板</h3>
      
      {isEditing ? (
        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="输入新的默认里程碑..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
            />
            <button
              onClick={addMilestone}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      ) : null}
      
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {defaultMilestones.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">暂无默认里程碑</p>
        ) : (
          defaultMilestones.map((milestone, index) => (
            <div 
              key={milestone.id || index} 
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center flex-1 min-w-0">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white mr-2"
                    autoFocus
                    onBlur={saveEdit}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  />
                ) : (
                  <span className="truncate mr-2">{milestone.name}</span>
                )}
              </div>
              
              {isEditing && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    title="上移"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === defaultMilestones.length - 1}
                    className="p-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    title="下移"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => startEditing(index, milestone.name)}
                    className="p-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteMilestone(index)}
                    className="p-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {isEditing && defaultMilestones.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          提示：拖拽或使用上下箭头按钮可以调整里程碑顺序
        </div>
      )}
    </div>
  );
};

export default DefaultMilestonesEditor;