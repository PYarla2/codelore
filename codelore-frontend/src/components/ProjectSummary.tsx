import React from 'react';

interface ProjectSummaryProps {
  summary: string;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Project Summary</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary; 