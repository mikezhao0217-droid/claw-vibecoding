'use client';

import React, { useState, useEffect } from 'react';
import { Department, Team } from '@/types/project';
import { 
  addDepartment as addDepartmentService,
  updateDepartment as updateDepartmentService,
  deleteDepartment as deleteDepartmentService,
  addTeam as addTeamService,
  updateTeam as updateTeamService,
  deleteTeam as deleteTeamService
} from '@/services/projectService';

interface DepartmentTeamManagerProps {
  departments: Department[];
  teams: Team[];
  onDepartmentsUpdate: (departments: Department[]) => void;
  onTeamsUpdate: (teams: Team[]) => void;
  isEditing: boolean;
}

const DepartmentTeamManager: React.FC<DepartmentTeamManagerProps> = ({
  departments,
  teams,
  onDepartmentsUpdate,
  onTeamsUpdate,
  isEditing
}) => {
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  // Cancel editing department
  const cancelDeptEdit = () => {
    setEditingDeptId(null);
    setEditingDeptName('');
  };

  // Start editing department
  const startDeptEdit = (dept: Department) => {
    setEditingDeptId(dept.id);
    setEditingDeptName(dept.name);
  };

  // Save edited department
  const saveDeptEdit = async (id: string) => {
    if (!editingDeptName.trim()) return;
    
    const success = await updateDepartmentService(id, editingDeptName);
    if (success) {
      onDepartmentsUpdate(
        departments.map(dept => 
          dept.id === id ? { ...dept, name: editingDeptName } : dept
        )
      );
      cancelDeptEdit();
    }
  };

  // Generate a unique ID from the name
  const generateIdFromName = (name: string, existingItems: Array<{id: string, name: string}>) => {
    let baseId = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!baseId) return '';
    
    let uniqueId = baseId;
    let counter = 1;
    
    // Check if the generated ID already exists
    while (existingItems.some(item => item.id === uniqueId)) {
      uniqueId = `${baseId}${counter}`;
      counter++;
    }
    
    return uniqueId;
  };

  // Add new department
  const addNewDepartment = async () => {
    if (!newDeptName.trim()) return;
    
    // Generate a unique ID based on the name
    const newId = generateIdFromName(newDeptName, departments);
    if (!newId) {
      alert('请输入有效的部门名称');
      return;
    }
    
    const newDept = { id: newId, name: newDeptName.trim() };
    const success = await addDepartmentService(newDept);
    if (success) {
      onDepartmentsUpdate([...departments, { ...newDept, deleted: false }]);
      setNewDeptName('');
    } else {
      alert('添加部门失败，请检查部门名称是否已存在');
    }
  };

  // Delete department
  const deleteDepartment = async (id: string) => {
    if (window.confirm(`确定要删除部门 "${departments.find(d => d.id === id)?.name}" 吗？`)) {
      const success = await deleteDepartmentService(id);
      if (success) {
        onDepartmentsUpdate(
          departments.map(dept => 
            dept.id === id ? { ...dept, deleted: true } : dept
          )
        );
        console.log(`Department ${id} marked as deleted`);
      } else {
        console.error(`Failed to delete department ${id}`);
        alert('删除部门失败，请稍后重试');
      }
    }
  };

  // Cancel editing team
  const cancelTeamEdit = () => {
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  // Start editing team
  const startTeamEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingTeamName(team.name);
  };

  // Save edited team
  const saveTeamEdit = async (id: string) => {
    if (!editingTeamName.trim()) return;
    
    const success = await updateTeamService(id, editingTeamName);
    if (success) {
      onTeamsUpdate(
        teams.map(team => 
          team.id === id ? { ...team, name: editingTeamName } : team
        )
      );
      cancelTeamEdit();
    }
  };

  // Add new team
  const addNewTeam = async () => {
    if (!newTeamName.trim()) return;
    
    // Generate a unique ID based on the name
    const newId = generateIdFromName(newTeamName, teams);
    if (!newId) {
      alert('请输入有效的团队名称');
      return;
    }
    
    const newTeam = { id: newId, name: newTeamName.trim() };
    const success = await addTeamService(newTeam);
    if (success) {
      onTeamsUpdate([...teams, { ...newTeam, deleted: false }]);
      setNewTeamName('');
    } else {
      alert('添加团队失败，请检查团队名称是否已存在');
    }
  };

  // Delete team
  const deleteTeam = async (id: string) => {
    if (window.confirm(`确定要删除团队 "${teams.find(t => t.id === id)?.name}" 吗？`)) {
      const success = await deleteTeamService(id);
      if (success) {
        onTeamsUpdate(
          teams.map(team => 
            team.id === id ? { ...team, deleted: true } : team
          )
        );
        console.log(`Team ${id} marked as deleted`);
      } else {
        console.error(`Failed to delete team ${id}`);
        alert('删除团队失败，请稍后重试');
      }
    }
  };

  // Filter out deleted departments and teams for display
  const activeDepartments = departments.filter(dept => !dept.deleted);
  const activeTeams = teams.filter(team => !team.deleted);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">部门和团队管理</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Departments Management */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">部门管理</h4>
          </div>
          
          {/* Add New Department Form */}
          {isEditing && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">添加新部门</h5>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="部门名称"
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addNewDepartment}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  添加部门
                </button>
              </div>
            </div>
          )}
          
          {/* Departments List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {activeDepartments.map((dept) => (
              <div key={dept.id} className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
                {editingDeptId === dept.id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingDeptName}
                      onChange={(e) => setEditingDeptName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => saveDeptEdit(dept.id)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelDeptEdit}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm">{dept.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({dept.id})</span>
                  </div>
                )}
                
                {isEditing && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startDeptEdit(dept)}
                      className="p-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteDepartment(dept.id)}
                      className="p-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {activeDepartments.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-2">暂无部门</p>
            )}
          </div>
        </div>
        
        {/* Teams Management */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">团队管理</h4>
          </div>
          
          {/* Add New Team Form */}
          {isEditing && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">添加新团队</h5>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="团队名称"
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addNewTeam}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  添加团队
                </button>
              </div>
            </div>
          )}
          
          {/* Teams List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {activeTeams.map((team) => (
              <div key={team.id} className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
                {editingTeamId === team.id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingTeamName}
                      onChange={(e) => setEditingTeamName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => saveTeamEdit(team.id)}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelTeamEdit}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm">{team.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({team.id})</span>
                  </div>
                )}
                
                {isEditing && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startTeamEdit(team)}
                      className="p-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="p-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {activeTeams.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-2">暂无团队</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentTeamManager;