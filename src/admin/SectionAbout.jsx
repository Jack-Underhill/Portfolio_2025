import InputText from './InputText';
import InputTextArea from './InputTextArea';
import InputFile from './InputFile';
import ViewImage from './ViewImage';

function SectionAbout({ state, onChange }) {
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
                    <InputFile
                        id="profileImage"
                        label="Profile image"
                        accept="image/*"
                        onChange={(file) => updateField('profileImageFile', file)}
                    />
                    <ViewImage
                        file={profileImageFile}
                        url={profileImageUrl}
                        alt="Profile preview"
                        isFixedSize={true}
                    />
                </div>

                <div className="space-y-4">
                    <InputText
                        id="professionTitle"
                        label="Profession title"
                        value={professionTitle}
                        onChange={(value) => updateField('professionTitle', value)}
                    />

                    <InputTextArea
                        id="professionBio"
                        label="Profession bio"
                        value={professionBio}
                        onChange={(value) => updateField('professionBio', value)}
                    />

                    <div className="space-y-1">
                        <InputFile
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

export default SectionAbout;
