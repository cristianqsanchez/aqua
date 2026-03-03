'use client';

import { useState } from 'react';
import { CalendarRange, ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ProjectsList } from './components/projects-list';
import { ProjectDetail } from './components/project-detail';
import { CreateProject } from './components/create-project';
import { EditProject } from './components/edit-project';
import { ProjectPlanningGantt } from './components/project-planning-gantt';

type ProjectsView = 'list' | 'detail' | 'create' | 'edit' | 'planning';


export default function Projects() {
  const t = useTranslations('projects');
  const td = useTranslations('dashboard');

  const [currentView, setCurrentView] = useState<ProjectsView>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleViewProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProjectId(null);
  };

  const handleCreateProject = () => {
    setCurrentView('create');
  };

  const handleEditProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('edit');
  };

  const handleOpenGantt = (projectId?: string) => {
    setCurrentView('planning');
    if (projectId) {
      // TODO: Set selected project in Gantt view
      // eslint-disable-next-line no-console
      console.log('Opening Gantt for project:', projectId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'list' && (
        <>

          <div className="bg-card border-b border-border px-8 py-6">
            <div className="mx-auto max-w-450">

              <div className="mb-3 flex items-center justify-between">
                <div>

                  <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>

                  <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>

                <Button variant="outline" onClick={() => handleOpenGantt()} className="gap-2">
                  <CalendarRange className="h-4 w-4" />
                  {t('planningView')}
                </Button>
              </div>

              <div className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">

                {td('centralBranch')}
              </div>
            </div>
          </div>

          <ProjectsList
            onViewProject={handleViewProject}

            onCreateProject={handleCreateProject}
            onOpenGantt={handleOpenGantt}
            onEditProject={handleEditProject}
          />
        </>
      )}

      {currentView === 'detail' && selectedProjectId && (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={handleBackToList}
          onEdit={handleEditProject}
          onOpenGantt={handleOpenGantt}
        />

      )}


      {currentView === 'create' && <CreateProject onBack={handleBackToList} />}

      {currentView === 'edit' && selectedProjectId && (
        <EditProject projectId={selectedProjectId} onBack={handleBackToList} />

      )}

      {currentView === 'planning' && (
        <>
          <div className="p-6">
            <Button variant="ghost" onClick={handleBackToList} className="mb-4 gap-2">
              <ChevronLeft className="h-4 w-4" />
              {t('backToProjectList')}
            </Button>
          </div>
          <ProjectPlanningGantt />

        </>

      )}
    </div>
  );
}
