import Accordion from 'react-bootstrap/Accordion';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';

type PageProps = {
    children: any
    eventKey: string
}

export default function ThemeAccordionToggle(props: PageProps) {
    const decoratedOnClick = useAccordionButton(props.eventKey, () =>
        console.log('totally custom!'),
    );

    return (
        <div onClick={decoratedOnClick}>
            {props.children}
        </div>
    );
}
