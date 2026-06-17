import AdminPageWrapper from '../shell/AdminPageWrapper';
import CredentialsSection from '../sections/CredentialsSection';

function CertificationsAdminPage({ credentialsState, onCredentialsChange }) {
    return (
        <AdminPageWrapper
            name="Certifications"
            desc="Manage the credential rows used for certification and education content."
            component={
                <CredentialsSection
                    state={credentialsState}
                    onChange={onCredentialsChange}
                />
            }
        />
    );
}

export default CertificationsAdminPage;
