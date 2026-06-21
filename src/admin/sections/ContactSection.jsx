import { useEffect, useMemo, useState } from 'react';
import SocialLinkItem from '../social/SocialLinkItem';
import Text from '../../components/ui/Text';
import CardSelector from '../navigation/CardSelector';
import AdminSectionToolbar from '../shell/AdminSectionToolbar';
import { adminUi } from '../../styles/recipes';

function moveItem(list, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= list.length) return list;

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

function getLinkSelectorId(link, index) {
    return link?.id ?? `contact-link-${index}`;
}

function resolveActiveLinkId(linkCards, currentId) {
    if (!linkCards.length) return null;
    if (linkCards.some((card) => card.id === currentId)) return currentId;

    return linkCards[0].id;
}

function ContactSection({ state, onChange }) {
    const socialLinks = useMemo(
        () => (Array.isArray(state?.socialLinks) ? state.socialLinks : []),
        [state?.socialLinks],
    );
    const linkCards = useMemo(() => socialLinks.map((link, index) => ({
        id: getLinkSelectorId(link, index),
        title: link.label || `Link ${index + 1}`,
    })), [socialLinks]);
    const [activeLinkId, setActiveLinkId] = useState(linkCards[0]?.id ?? null);

    useEffect(() => {
        setActiveLinkId((currentId) => resolveActiveLinkId(linkCards, currentId));
    }, [linkCards]);

    const activeLinkIndex = linkCards.findIndex((card) => card.id === activeLinkId);
    const activeLink = activeLinkIndex >= 0 ? socialLinks[activeLinkIndex] : null;

    // --- add / update / remove ---
    const updateField = (field, value) => {
        onChange({ ...(state || {}), [field]: value });
    };

    const handleSocialChange = (index, field, value) => {
        const next = [...socialLinks];
        next[index] = { ...next[index], [field]: value };
        updateField('socialLinks', next);
    };

    const handleAddLink = () => {
        const link = {
            id: crypto.randomUUID(),
            label: '',
            url: '',
            iconFile: null,
            iconUrl: '',
            published: true,
        };
        const next = [
            ...socialLinks,
            link,
        ];
        updateField('socialLinks', next);
        setActiveLinkId(link.id);
    };

    const handleRemoveLink = (index) => {
        const next = socialLinks.filter((_, i) => i !== index);
        const nextActiveIndex = Math.min(index, next.length - 1);

        updateField('socialLinks', next);
        setActiveLinkId(
            nextActiveIndex >= 0
                ? getLinkSelectorId(next[nextActiveIndex], nextActiveIndex)
                : null,
        );
    };

    const handleReorderLink = (fromIndex, toIndex) => {
        updateField('socialLinks', moveItem(socialLinks, fromIndex, toIndex));
    };

    return (
        <div className="space-y-4">
            {socialLinks.length > 0 ? (
                <>
                    <AdminSectionToolbar>
                        <CardSelector
                            cardTypeId="Contact Link"
                            cards={linkCards}
                            activeId={activeLinkId}
                            onSelect={setActiveLinkId}
                            onReorder={handleReorderLink}
                        />
                    </AdminSectionToolbar>

                    <button
                        type="button"
                        onClick={handleAddLink}
                        aria-label="Add social or professional link"
                        className={adminUi.secondaryButton}
                    >
                        + Add link
                    </button>

                    {activeLink && (
                        <SocialLinkItem
                            key={getLinkSelectorId(activeLink, activeLinkIndex)}
                            link={activeLink}
                            index={activeLinkIndex}
                            onChange={(field, value) => handleSocialChange(activeLinkIndex, field, value)}
                            onRemove={() => handleRemoveLink(activeLinkIndex)}
                        />
                    )}
                </>
            ) : (
                <>
                    <p className={adminUi.emptyText}>No social or professional links.</p>

                    <button
                        type="button"
                        onClick={handleAddLink}
                        aria-label="Add social or professional link"
                        className={adminUi.secondaryButton}
                    >
                        + Add link
                    </button>
                </>
            )}
        </div>
    );
}

export default ContactSection;
