import Text from '../../components/ui/Text';

function FieldLabel({ htmlFor, children }) {
    return (
        <Text
            as="label"
            htmlFor={htmlFor}
            variant="adminLabel"
            className="block mb-1"
        >
            {children}
        </Text>
    );
}

export default FieldLabel;
