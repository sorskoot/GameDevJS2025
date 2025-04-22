import { Align, ReactUiBase } from '@wonderlandengine/react-ui';
import {
    Column,
    Container,
    MaterialContext,
    Panel,
    Plane,
    ProgressBar,
    Row,
    Text,
    ThemeContext,
} from '@wonderlandengine/react-ui/components';
import React, { useEffect, useState } from 'react';
import { PlayerState } from '../classes/PlayerState.js';

const App = (props: { comp: MainUI }) => {
    const comp = props.comp;
    const theme = {};

    const [lightEnergy, setLightEnergy] = useState(
        PlayerState.instance.lightEnergy / PlayerState.instance.maxEnergy
    );
    const [darkEnergy, setDarkEnergy] = useState(
        PlayerState.instance.darkEnergy / PlayerState.instance.maxEnergy
    );

    useEffect(() => {
        const update = () => {
            setLightEnergy(
                PlayerState.instance.lightEnergy /
                    PlayerState.instance.maxEnergy
            );
            setDarkEnergy(
                PlayerState.instance.darkEnergy / PlayerState.instance.maxEnergy
            );
        };
        PlayerState.instance.subscribeEnergyChange(update);
        // Initial update in case values changed before mount
        update();
        return () => {
            PlayerState.instance.unsubscribeEnergyChange(update);
        };
    }, []);

    return (
        <MaterialContext.Provider value={comp}>
            <ThemeContext.Provider value={theme}>
                {/* <GuiMaterialContext.Provider
                    value={GuiTexturesManager.instance}
                > */}
                <Container width="100%" height="100%">
                    <Column margin={50} gap={10}>
                        <Row gap={10} alignItems={Align.Center}>
                            <Text
                                width={100}
                                fontSize={22}
                                textAlign="right"
                                text="Light"
                            ></Text>
                            <ProgressBar
                                value={lightEnergy}
                                width={400}
                                height={40}
                                rounding={0}
                                bgColor={'#440044'}
                                fgColor={'#FF00FF'}
                            ></ProgressBar>
                        </Row>
                        <Row gap={10} alignItems={Align.Center}>
                            <Text
                                width={100}
                                fontSize={22}
                                textAlign="right"
                                text="Dark"
                            ></Text>
                            <ProgressBar
                                value={darkEnergy}
                                width={400}
                                height={40}
                                rounding={0}
                                bgColor={'#440044'}
                                fgColor={'#FF00FF'}
                            ></ProgressBar>
                        </Row>
                    </Column>
                </Container>
                {/* </GuiMaterialContext.Provider> */}
            </ThemeContext.Provider>
        </MaterialContext.Provider>
    );
};

export class MainUI extends ReactUiBase {
    static TypeName = 'main-ui';
    static InheritProperties = true;

    override async start(): Promise<void> {
        super.start();
    }

    override update(dt: number) {
        super.update(dt);
    }

    render() {
        return <App comp={this} />;
    }
}
