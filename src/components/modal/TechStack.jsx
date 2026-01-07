import PillHighlightList from '../PillHighlightList';

export default function TechStack({ data }) {
    const techStack = data?.techStack;

    const isValidList = (list) => {
        return list && list[0]?.length > 0;
    }

    function ListTechSection({ list, label }) {
        return (
            <>
                {isValidList(list) && (
                    <div className="space-y-2">
                        <div className="text-emerald-50/80 text-sm font-semibold">
                            {label}
                        </div>
                        <PillHighlightList 
                            textArray={(list ?? [])}
                            className=''
                            isOnlyHighlightedOnHover={true}
                        />
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="space-y-4">
            <ListTechSection list={techStack?.frontend}        label="Frontend" />
            <ListTechSection list={techStack?.backend}         label="Backend" />
            <ListTechSection list={techStack?.data}            label="Data" />
            <ListTechSection list={techStack?.infrastructure}  label="Infrastructure" />
        </div>
    );
}