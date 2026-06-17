import AdminPageWrapper from '../shell/AdminPageWrapper';
import ContactSection from '../sections/ContactSection';

function ContactAdminPage({ contactState, onContactChange }) {
    return (
        <AdminPageWrapper
            name="Contact"
            desc="Update social and professional links that appear in the contact surface."
            component={
                <ContactSection
                    state={contactState}
                    onChange={onContactChange}
                />
            }
        />
    );
}

export default ContactAdminPage;
