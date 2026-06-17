import AdminPageWrapper from '../shell/AdminPageWrapper';
import CredentialsSection from '../sections/CredentialsSection';

function EducationAdminPage({ credentialsState, onCredentialsChange }) {
    return (
        <AdminPageWrapper
            name="Education"
            desc="Manage the credential rows used for education and certification content."
            component={
                <CredentialsSection
                    state={credentialsState}
                    onChange={onCredentialsChange}
                />
            }
        />
    );
}

export default EducationAdminPage;
