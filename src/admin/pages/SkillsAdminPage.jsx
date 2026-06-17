import AdminPageWrapper from '../shell/AdminPageWrapper';
import SkillsSection from '../sections/SkillsSection';

function SkillsAdminPage({ skillsState, onSkillsChange }) {
    return (
        <AdminPageWrapper
            name="Skills"
            desc="Organize the skill groups and individual skill chips shown on the public portfolio."
            component={
                <SkillsSection
                    state={skillsState}
                    onChange={onSkillsChange}
                />
            }
        />
    );
}

export default SkillsAdminPage;
