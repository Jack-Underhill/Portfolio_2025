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
        listKey: 'education',
        singular: 'education credential',
        title: 'Education',
        addLabel: '+ Add Education',
    },
    certification: {
        listKey: 'certifications',
        singular: 'certification',
        title: 'Certifications',
        addLabel: '+ Add Certification',
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

function CredentialsSection({ state, onChange }) {
    const education = useMemo(
        () => (Array.isArray(state?.education) ? state.education : []),
        [state?.education],
    );
    const certifications = useMemo(
        () => (Array.isArray(state?.certifications) ? state.certifications : []),
        [state?.certifications],
    );
    const [activeIds, setActiveIds] = useState({
        education: education[0]?.id ?? null,
        certification: certifications[0]?.id ?? null,
    });

    useEffect(() => {
        setActiveIds((current) => ({
            education: resolveActiveId(education, current.education),
            certification: resolveActiveId(certifications, current.certification),
        }));
    }, [education, certifications]);

    const setCredentialsForKind = (kind, updater) => {
        const config = CREDENTIAL_KINDS[kind];
        const current = config.listKey === 'education' ? education : certifications;
        const nextRaw = typeof updater === 'function' ? updater(current) : updater;
        const next = normalizeCredentialOrder(nextRaw, kind);

        onChange({
            ...(state || {}),
            [config.listKey]: next,
        });
    };

    const updateCredential = (kind, id, patch) => {
        setCredentialsForKind(kind, (list) => list.map((credential) => (
            credential.id === id ? { ...credential, ...patch } : credential
        )));
    };

    const addCredential = (kind) => {
        const config = CREDENTIAL_KINDS[kind];
        const current = config.listKey === 'education' ? education : certifications;
        const credential = createEmptyCredential(kind, current.length);

        setCredentialsForKind(kind, (list) => [...list, credential]);
        setActiveIds((ids) => ({ ...ids, [kind]: credential.id }));
    };

    const removeCredential = (kind, id) => {
        setCredentialsForKind(kind, (list) => list.filter((credential) => credential.id !== id));
    };

    const reorderCredential = (kind, fromIndex, toIndex) => {
        setCredentialsForKind(kind, (list) => moveItem(list, fromIndex, toIndex));
    };

    return (
        <div id="admin-credentials" className="grid gap-6 xl:grid-cols-2">
            <CredentialPanel
                kind="education"
                credentials={education}
                activeId={activeIds.education}
                onSelect={(id) => setActiveIds((ids) => ({ ...ids, education: id }))}
                onAdd={() => addCredential('education')}
                onChange={updateCredential}
                onRemove={removeCredential}
                onReorder={reorderCredential}
            />

            <CredentialPanel
                kind="certification"
                credentials={certifications}
                activeId={activeIds.certification}
                onSelect={(id) => setActiveIds((ids) => ({ ...ids, certification: id }))}
                onAdd={() => addCredential('certification')}
                onChange={updateCredential}
                onRemove={removeCredential}
                onReorder={reorderCredential}
            />
        </div>
    );
}

function CredentialPanel({
    kind,
    credentials,
    activeId,
    onSelect,
    onAdd,
    onChange,
    onRemove,
    onReorder,
}) {
    const config = CREDENTIAL_KINDS[kind];
    const activeCredential = credentials.find((credential) => credential.id === activeId) ?? null;

    return (
        <div className={adminUi.editorPanel}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{config.title}</h3>
                    <Text as="p" variant="adminLabel">
                        {credentials.length} saved draft {credentials.length === 1 ? 'row' : 'rows'}
                    </Text>
                </div>

                <button
                    type="button"
                    onClick={onAdd}
                    aria-label={config.addLabel.replace('+ ', '')}
                    className={adminUi.secondaryButton}
                >
                    {config.addLabel}
                </button>
            </div>

            {credentials.length > 0 ? (
                <>
                    <CardSelector
                        cardTypeId={config.title}
                        cards={credentials}
                        activeId={activeId}
                        onSelect={onSelect}
                        onReorder={(fromIndex, toIndex) => onReorder(kind, fromIndex, toIndex)}
                    />

                    {activeCredential && (
                        <CredentialEditor
                            credential={activeCredential}
                            kind={kind}
                            index={credentials.findIndex((item) => item.id === activeCredential.id)}
                            total={credentials.length}
                            onChange={(patch) => onChange(kind, activeCredential.id, patch)}
                            onRemove={() => onRemove(kind, activeCredential.id)}
                            onMove={(fromIndex, toIndex) => onReorder(kind, fromIndex, toIndex)}
                        />
                    )}
                </>
            ) : (
                <p className={adminUi.emptyText}>No {config.title.toLowerCase()} rows.</p>
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

export default CredentialsSection;
