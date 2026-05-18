import { PROJECT_TYPE_OPTIONS } from '../../../domain/projects/constants';
import FieldLabel from '../../forms/FieldLabel';
import TextInput from '../../forms/TextInput';
import TechListEditor from '../../lists/TechListEditor';
import { adminForm, adminUi } from '../../../styles/recipes';

function ProjectClassificationFields({
  projectId,
  featuredRank,
  projectType,
  labels,
  handleFieldChange,
}) {
  return (
    <div className={adminUi.divider}>
      <p className={adminUi.sectionLabel}>Classification</p>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          id={`project-featured-rank-${projectId}`}
          label="Featured rank"
          type="number"
          step="1"
          value={featuredRank ?? ''}
          onChange={(value) => handleFieldChange('featuredRank', value)}
        />

        <div className="space-y-1">
          <FieldLabel htmlFor={`project-type-${projectId}`}>
            Project type
          </FieldLabel>
          <select
            id={`project-type-${projectId}`}
            value={projectType ?? ''}
            onChange={(event) => handleFieldChange('projectType', event.target.value)}
            className={adminForm.input}
          >
            <option value="">Unclassified</option>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TechListEditor
        idPrefix={`project-labels-${projectId}`}
        label="Display labels"
        values={labels || ['']}
        onChange={(next) => handleFieldChange('labels', next)}
        addLabel="+ Add label"
      />
    </div>
  );
}

export default ProjectClassificationFields;
