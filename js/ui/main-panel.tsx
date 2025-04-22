import { Align, Justify, PositionType } from '@wonderlandengine/react-ui';
import {
    Button,
    Column,
    Container,
    Panel,
    Text,
} from '@wonderlandengine/react-ui/components';
import React from 'react';
import { startGame } from './functions/startGame.js';

export const MainPanel = () => {
    return (
        <Container width="100%" height="100%" position={PositionType.Absolute}>
            <Container
                height="100%"
                alignItems={Align.Center}
                alignContent={Align.Center}
                justifyContent={Justify.Center}
            >
                <Panel backgroundColor={'#FFFFFF'} rounding={0} padding={50}>
                    <Column
                        alignItems={Align.Center}
                        justifyContent={Justify.Center}
                        gap={10}
                    >
                        <Text
                            color={'#000000'}
                            fontSize={120}
                            text="EQUILIBRIUM"
                        ></Text>
                        <Button
                            rounding={10}
                            backgroundColor={'#440044'}
                            active={{}}
                            hovered={{ backgroundColor: '#880088' }}
                            height={100}
                            width={300}
                            alignContent={Align.Center}
                            justifyContent={Justify.Center}
                            onClick={() => startGame()}
                        >
                            <Text z={0.01} textAlign="center">
                                PLAY
                            </Text>
                        </Button>
                    </Column>
                </Panel>
            </Container>
        </Container>
    );
};
