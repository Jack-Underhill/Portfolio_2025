import AdminPageWrapper from '../shell/AdminPageWrapper';
import AboutSection from '../sections/AboutSection';

function AboutAdminPage({ aboutState, onAboutChange }) {
    return (
        <AdminPageWrapper
            name="About"
            desc="Manage the profile content, resume, and primary introduction shown across the portfolio."
            component={
                <AboutSection
                    state={aboutState}
                    onChange={onAboutChange}
                />
            }
        />
    );
}

export default AboutAdminPage;
