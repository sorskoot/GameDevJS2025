import { ReactUiBase } from '@wonderlandengine/react-ui';
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
import React from 'react';

const App = (props: { comp: MainUI }) => {
    const comp = props.comp;
    const theme = {};
    // const DefaultTheme: ThemeContextValue = {
    //     panel: {
    //         borderSize: 200,
    //         rounding: 0,
    //         borderTextureSize: 0.4,
    //         material: GuiTexturesManager.instance.windowMaterial,
    //         padding: 25,
    //     },
    //     button: {
    //         rounding: 0,
    //     },
    // };

    return (
        <MaterialContext.Provider value={comp}>
            <ThemeContext.Provider value={theme}>
                {/* <GuiMaterialContext.Provider
                    value={GuiTexturesManager.instance}
                > */}
                <Container width="100%" height="100%">
                    <Column margin={50}>
                        <Row>
                            <Text
                                width={100}
                                fontSize={22}
                                textAlign="right"
                                text="Light"
                            ></Text>
                            <ProgressBar
                                value={0.5}
                                width={100}
                                height={20}
                                rounding={0}
                            ></ProgressBar>
                        </Row>
                        <Row>
                            <Text
                                width={100}
                                fontSize={22}
                                textAlign="right"
                                text="Dark"
                            ></Text>
                            <ProgressBar
                                value={0.5}
                                width={100}
                                height={20}
                                rounding={0}
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
