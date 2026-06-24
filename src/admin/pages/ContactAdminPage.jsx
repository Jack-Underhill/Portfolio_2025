import AdminPageWrapper from '../shell/AdminPageWrapper';
import ContactSection from '../sections/ContactSection';

function ContactAdminPage({ contactState, onContactChange, onAdminSectionMount }) {
    return (
        <AdminPageWrapper
            name="Contact"
            desc="Update social and professional links that appear in the contact surface."
            onSectionMount={onAdminSectionMount}
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
