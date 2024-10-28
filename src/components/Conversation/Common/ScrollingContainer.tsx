import React, { useEffect, useRef, useState } from 'react';

import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Icon from '@cloudscape-design/components/icon';

import { useDebouncedCallback } from 'use-debounce';

import { useScroll } from '@/hooks/useScroll';

import styles from './ScrollingContainer.module.css';

type ScrollingContainerProps = {
    containerTitle: string;
    containerActions?: React.ReactNode;
    children: React.ReactNode;
};
export default function ScrollingContainer({
    containerTitle,
    containerActions = null,
    children,
}: ScrollingContainerProps) {
    const [showUpScroll, setShowUpScroll] = useState<boolean>(false);
    const [showDownScroll, setShowDownScroll] = useState<boolean>(false);

    // Use a ref for the right panel container, so we can show arrows for scrolling
    const childContainerRef = useRef(null);
    function handleScroll(e: Event) {
        const scrollElement = e.target as HTMLElement;
        const scrollLeftTop = scrollElement.scrollTop > 0;
        if (scrollLeftTop) {
            setShowUpScroll(true);
        } else {
            setShowUpScroll(false);
        }
        const scrollAtBottom = scrollElement.scrollHeight - scrollElement.scrollTop === scrollElement.clientHeight;
        if (scrollAtBottom) {
            setShowDownScroll(false);
        } else {
            setShowDownScroll(true);
        }
    }
    const debouncedHandleScroll = useDebouncedCallback(handleScroll, 300);
    useScroll(childContainerRef, debouncedHandleScroll);

    // Show down scroll if the scroll height (entire child div) is larger than client height (visible child div)
    useEffect(() => {
        if (childContainerRef.current == null) return;
        const childContainer = childContainerRef.current as HTMLElement;
        if (childContainer.scrollHeight > childContainer.clientHeight) setShowDownScroll(true);
    }, [childContainerRef.current]);

    return (
        <Container
            header={
                <Header variant="h2" actions={containerActions}>
                    {containerTitle}
                </Header>
            }
        >
            {showUpScroll && (
                <div className={styles.scrollUpIcon}>
                    <Icon name="angle-up" size="medium" />
                </div>
            )}
            <div className={styles.childDiv} ref={childContainerRef}>
                {children}
            </div>
            {showDownScroll && (
                <div className={styles.scrollDownIcon}>
                    <Icon name="angle-down" size="medium" />
                </div>
            )}
        </Container>
    );
}
