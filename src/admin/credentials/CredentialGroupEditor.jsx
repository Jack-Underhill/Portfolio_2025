import { useEffect, useMemo, useState } from 'react';

import Text from '../../components/ui/Text';
import TextInput from '../forms/TextInput';
import TextAreaInput from '../forms/TextAreaInput';
import FieldLabel from '../forms/FieldLabel';
import TechListEditor from '../lists/TechListEditor';
import CardSelector from '../navigation/CardSelector';
import { adminForm, adminUi } from '../../styles/recipes';

const CREDENTIAL_KINDS = {
    education: {
        singular: 'education credential',
        title: 'Education',
        addLabel: '+ Add Education',
        emptyLabel: 'No education rows.',
    },
    certification: {
        singular: 'certification',
        title: 'Certifications',
        addLabel: '+ Add Certification',
        emptyLabel: 'No certification rows.',
    },
};

const LOGO_KEY_OPTIONS = [
    { value: '', label: 'None' },
    { value: 'wsu', label: 'WSU' },
    { value: 'edcc', label: 'Edmonds College' },
    { value: 'microsoft', label: 'Microsoft' },
];

function createEmptyCredential(kind, sortOrder) {
    return {
        id: crypto.randomUUID(),
        kind,
        title: '',
        org: '',
        credentialType: '',
        desc: '',
        chips: [],
        issued: '',
        gpa: '',
        link: '',
        logoUrl: '',
        logoKey: '',
        logoScale: 0.7,
        published: true,
        sortOrder,
    };
}

function normalizeCredentialOrder(list, kind) {
    return list.map((credential, index) => ({
        ...credential,
        kind,
        chips: Array.isArray(credential.chips) ? credential.chips : [],
        logoScale: credential.logoScale ?? 0.7,
        published: credential.published !== false,
        sortOrder: index,
    }));
}

function moveItem(list, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= list.length) return list;

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

function CredentialGroupEditor({ kind, credentials, onCredentialsChange }) {
    const config = CREDENTIAL_KINDS[kind];
    const credentialList = useMemo(
        () => (Array.isArray(credentials) ? credentials : []),
        [credentials],
    );
    const [activeId, setActiveId] = useState(credentialList[0]?.id ?? null);

    useEffect(() => {
        setActiveId((currentId) => resolveActiveId(credentialList, currentId));
    }, [credentialList]);

    const setCredentials = (updater) => {
        const nextRaw = typeof updater === 'function' ? updater(credentialList) : updater;
        onCredentialsChange(normalizeCredentialOrder(nextRaw, kind));
    };

    const updateCredential = (id, patch) => {
        setCredentials((list) => list.map((credential) => (
            credential.id === id ? { ...credential, ...patch } : credential
        )));
    };

    const addCredential = () => {
        const credential = createEmptyCredential(kind, credentialList.length);

        setCredentials((list) => [...list, credential]);
        setActiveId(credential.id);
    };

    const removeCredential = (id) => {
        setCredentials((list) => list.filter((credential) => credential.id !== id));
    };

    const reorderCredential = (fromIndex, toIndex) => {
        setCredentials((list) => moveItem(list, fromIndex, toIndex));
    };

    if (!config) return null;

    const activeCredential = credentialList.find((credential) => credential.id === activeId) ?? null;

    return (
        <div className={adminUi.editorPanel}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">{config.title}</h2>
                    <Text as="p" variant="adminLabel">
                        {credentialList.length} saved draft {credentialList.length === 1 ? 'row' : 'rows'}
                    </Text>
                </div>

                <button
                    type="button"
                    onClick={addCredential}
                    aria-label={config.addLabel.replace('+ ', '')}
                    className={adminUi.secondaryButton}
                >
                    {config.addLabel}
                </button>
            </div>

            {credentialList.length > 0 ? (
                <>
                    <CardSelector
                        cardTypeId={config.title}
                        cards={credentialList}
                        activeId={activeId}
                        onSelect={setActiveId}
                        onReorder={reorderCredential}
                    />

                    {activeCredential && (
                        <CredentialEditor
                            credential={activeCredential}
                            kind={kind}
                            index={credentialList.findIndex((item) => item.id === activeCredential.id)}
                            total={credentialList.length}
                            onChange={(patch) => updateCredential(activeCredential.id, patch)}
                            onRemove={() => removeCredential(activeCredential.id)}
                            onMove={reorderCredential}
                        />
                    )}
                </>
            ) : (
                <p className={adminUi.emptyText}>{config.emptyLabel}</p>
            )}
        </div>
    );
}

function CredentialEditor({
    credential,
    kind,
    index,
    total,
    onChange,
    onRemove,
    onMove,
}) {
    const config = CREDENTIAL_KINDS[kind];
    const credentialName = credential.title || config.singular;
    const idPrefix = `credential-${kind}-${credential.id}`;

    return (
        <div className={adminUi.divider}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className={adminUi.helperText}>sortOrder: {index}</p>
                    <p className={adminUi.emptyText}>ID: {credential.id ?? '(save to assign)'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-admin-text-muted select-none">
                        <input
                            type="checkbox"
                            checked={credential.published !== false}
                            aria-label={`Published state for ${credentialName}`}
                            onChange={(event) => onChange({ published: event.target.checked })}
                            className="h-4 w-4 rounded border-admin-checkbox-border bg-admin-panel"
                        />
                        Published
                    </label>

                    <button
                        type="button"
                        onClick={() => onMove(index, index - 1)}
                        disabled={index === 0}
                        aria-label={`Move ${credentialName} up`}
                        className={adminUi.iconButton}
                    >
                        Up
                    </button>

                    <button
                        type="button"
                        onClick={() => onMove(index, index + 1)}
                        disabled={index === total - 1}
                        aria-label={`Move ${credentialName} down`}
                        className={adminUi.iconButton}
                    >
                        Down
                    </button>

                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={`Remove ${credentialName}`}
                        className={adminUi.dangerLink}
                    >
                        Remove
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                    id={`${idPrefix}-title`}
                    label="Title"
                    value={credential.title || ''}
                    onChange={(value) => onChange({ title: value })}
                />

                <TextInput
                    id={`${idPrefix}-org`}
                    label="Organization"
                    value={credential.org || ''}
                    onChange={(value) => onChange({ org: value })}
                />

                <TextInput
                    id={`${idPrefix}-type`}
                    label="Credential type"
                    value={credential.credentialType || ''}
                    onChange={(value) => onChange({ credentialType: value })}
                />

                <TextInput
                    id={`${idPrefix}-issued`}
                    label="Issued label"
                    value={credential.issued || ''}
                    onChange={(value) => onChange({ issued: value })}
                />

                {kind === 'education' && (
                    <TextInput
                        id={`${idPrefix}-gpa`}
                        label="GPA"
                        value={credential.gpa || ''}
                        onChange={(value) => onChange({ gpa: value })}
                    />
                )}

                <TextInput
                    id={`${idPrefix}-link`}
                    label="Credential link"
                    value={credential.link || ''}
                    onChange={(value) => onChange({ link: value })}
                />

                <LogoKeySelect
                    id={`${idPrefix}-logo-key`}
                    value={credential.logoKey || ''}
                    onChange={(value) => onChange({ logoKey: value })}
                />

                <TextInput
                    id={`${idPrefix}-logo-url`}
                    label="Logo URL"
                    value={credential.logoUrl || ''}
                    onChange={(value) => onChange({ logoUrl: value })}
                />

                <LogoScaleInput
                    id={`${idPrefix}-logo-scale`}
                    value={credential.logoScale ?? 0.7}
                    onChange={(value) => onChange({ logoScale: value })}
                />

                <div className="md:col-span-2">
                    <TextAreaInput
                        id={`${idPrefix}-desc`}
                        label="Description"
                        value={credential.desc || ''}
                        onChange={(value) => onChange({ desc: value })}
                        minRows={3}
                    />
                </div>

                <div className="md:col-span-2">
                    <TechListEditor
                        idPrefix={`${idPrefix}-chips`}
                        label="Highlights"
                        values={credential.chips || []}
                        onChange={(chips) => onChange({ chips })}
                        addLabel="+ Add highlight"
                    />
                </div>
            </div>
        </div>
    );
}

function LogoKeySelect({ id, value, onChange }) {
    return (
        <div className="space-y-1">
            <FieldLabel htmlFor={id}>Logo key</FieldLabel>
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={adminForm.input}
            >
                {LOGO_KEY_OPTIONS.map((option) => (
                    <option key={option.value || 'none'} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function LogoScaleInput({ id, value, onChange }) {
    return (
        <div className="space-y-1">
            <FieldLabel htmlFor={id}>Logo scale</FieldLabel>
            <input
                id={id}
                type="number"
                min="0.4"
                max="1.2"
                step="0.01"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={adminForm.input}
            />
        </div>
    );
}

function resolveActiveId(credentials, currentId) {
    if (!credentials.length) return null;
    if (credentials.some((credential) => credential.id === currentId)) return currentId;

    return credentials[0].id;
}

export default CredentialGroupEditor;
