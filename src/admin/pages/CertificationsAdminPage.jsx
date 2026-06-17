import AdminPageWrapper from '../shell/AdminPageWrapper';
import CredentialGroupEditor from '../credentials/CredentialGroupEditor';

function CertificationsAdminPage({ credentialsState, onCredentialsChange }) {
    const certifications = Array.isArray(credentialsState?.certifications)
        ? credentialsState.certifications
        : [];
    const updateCertifications = (nextCertifications) => {
        onCredentialsChange({
            ...(credentialsState || {}),
            certifications: nextCertifications,
        });
    };

    return (
        <AdminPageWrapper
            name="Certifications"
            desc="Manage certification and certificate credential rows while preserving the grouped credentials payload."
            component={
                <CredentialGroupEditor
                    kind="certification"
                    credentials={certifications}
                    onCredentialsChange={updateCertifications}
                />
            }
        />
    );
}

export default CertificationsAdminPage;
