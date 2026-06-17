import AdminPageWrapper from '../shell/AdminPageWrapper';
import CredentialGroupEditor from '../credentials/CredentialGroupEditor';

function EducationAdminPage({ credentialsState, onCredentialsChange }) {
    const education = Array.isArray(credentialsState?.education) 
        ? credentialsState.education 
        : [];
    const updateEducation = (nextEducation) => {
        onCredentialsChange({
            ...(credentialsState || {}),
            education: nextEducation,
        });
    };

    return (
        <AdminPageWrapper
            name="Education"
            desc="Manage degree, minor, and transfer credential rows while preserving the grouped credentials payload."
            component={
                <CredentialGroupEditor
                    kind="education"
                    credentials={education}
                    onCredentialsChange={updateEducation}
                />
            }
        />
    );
}

export default EducationAdminPage;
