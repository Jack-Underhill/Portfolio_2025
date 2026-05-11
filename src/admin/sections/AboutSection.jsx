import TextInput from '../forms/TextInput';
import TextAreaInput from '../forms/TextAreaInput';
import FileInput from '../forms/FileInput';
import ImagePreview from '../media/ImagePreview';

function AboutSection({ state, onChange }) {
    const {
        profileImageFile,
        profileImageUrl,
        professionTitle,
        professionBio,
        resumeFile,
        resumeUrl,
    } = state;

    const updateField = (field, value) => {
        onChange({ ...state, [field]: value });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">About Section</h2>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                    <FileInput
                        id="profileImage"
                        label="Profile image"
                        accept="image/*"
                        onChange={(file) => updateField('profileImageFile', file)}
                    />
                    <ImagePreview
                        file={profileImageFile}
                        url={profileImageUrl}
                        alt="Profile preview"
                        isFixedSize={true}
                    />
                </div>

                <div className="space-y-4">
                    <TextInput
                        id="professionTitle"
                        label="Profession title"
                        value={professionTitle}
                        onChange={(value) => updateField('professionTitle', value)}
                    />

                    <TextAreaInput
                        id="professionBio"
                        label="Profession bio"
                        value={professionBio}
                        onChange={(value) => updateField('professionBio', value)}
                    />

                    <div className="space-y-1">
                        <FileInput
                            id="resumePdf"
                            label="Resume PDF"
                            accept="application/pdf"
                            onChange={(file) => updateField('resumeFile', file)}
                        />

                        {resumeUrl && (
                            <p className='text-xs text-slate-400'>
                                Current resume:{' '}
                                <a 
                                    href={resumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className='underline underline-offset-2 text-sky-400'
                                >
                                    Open in new tab
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutSection;
