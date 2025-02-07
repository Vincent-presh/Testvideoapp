import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RewardScreen() {
    return (
        <View style={styles.screen}>
            <Text style={styles.text}>Reward</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 30,
        fontWeight: 'bold',
    },
}); 