import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { ChevronRight, Play, Search } from 'react-native-feather';
import Video from 'react-native-video';
import { heroImage, continueWatchingData } from '../data/constants';
import { useNavigation, CommonActions, useIsFocused } from '@react-navigation/native';

import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Create an animated version of FastImage using Reanimated
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

const HomeScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // Reanimated shared values for opacity
    const imageOpacity = useSharedValue(1);
    const videoOpacity = useSharedValue(0);

    // Create animated styles using shared values
    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: imageOpacity.value,
        };
    });

    const videoAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: videoOpacity.value,
        };
    });

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            // Pause video and reset state when leaving screen
            setIsPlaying(false);
        });

        const focusSubscribe = navigation.addListener('focus', () => {
            // Only start playing after the initial fade-in timer
            setTimeout(() => {
                setIsPlaying(true);
            }, 3500); // 3000ms for initial delay + 500ms for fade
        });

        return () => {
            unsubscribe();
            focusSubscribe();
        };
    }, [navigation]);

    useEffect(() => {
        // Start a timer for 3 seconds then animate the transition
        const timer = setTimeout(() => {
            // Smoothly fade out the hero image over 500ms
            imageOpacity.value = withTiming(0, { duration: 500 });
            // And fade in the hero video over 500ms
            videoOpacity.value = withTiming(1, { duration: 500 });
            // Only set isPlaying if we're still on this screen
            if (navigation.isFocused()) {
                setIsPlaying(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [imageOpacity, videoOpacity]);

    const handlePlayPress = () => {
        if (videoRef.current) {
            // Preload video parameters
            navigation.dispatch(
                CommonActions.setParams({
                    screen: 'Shorts',
                    params: {
                        videoUrl: heroImage.videoUrl,
                        currentTime: currentTime,
                    },
                })
            );
            // Navigate after a short delay
            setTimeout(() => {

                navigation.navigate('Shorts', {
                    videoUrl: heroImage.videoUrl,
                    currentTime: currentTime,
                });
                setIsPlaying(false);
            }, 500);
        }
    };

    const onProgress = (data) => {
        setCurrentTime(data.currentTime);
    };

    const onBuffer = (data) => {
        console.log('Buffer event:', data);
    };

    const onLoad = (data) => {
        console.log('Load event:', data);
        setIsLoading(false);
    };

    const onLoadStart = (data) => {
        console.log('Load start event:', data);
        setIsLoading(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" />
            {/* Top Bar */}
            <View style={styles.topBar}>
                {/* Left placeholder (could hold a logo or menu) */}
                <View style={{ width: 24 }} />
                {/* Search Icon */}
                <View style={styles.searchIconWrapper}>
                    <Search stroke="#fff" width={24} height={24} />
                </View>
            </View>

            <ScrollView style={styles.content} bounces={false}>
                {/* HERO SECTION */}
                <View style={styles.heroContainer}>
                    {/* Hero Video wrapped in an Animated.View using reanimated style */}
                    <Animated.View style={[styles.absoluteFill, videoAnimatedStyle]}>
                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#fff" />
                            </View>
                        )}
                        <Video
                            ref={videoRef}
                            // Pause the video if either the HomeScreen isn't focused or its internal state isn't playing
                            paused={!isFocused || !isPlaying}
                            source={{
                                uri: heroImage.videoUrl,
                                shouldCache: true,
                                bufferConfig: {
                                    minBufferMs: 15000,
                                    maxBufferMs: 50000,
                                    bufferForPlaybackMs: 2500,
                                    bufferForPlaybackAfterRebufferMs: 5000,
                                },
                            }}
                            style={styles.absoluteFill}
                            resizeMode="cover"
                            muted={true}
                            repeat={true}
                            bufferingStrategy="Default"
                            onProgress={onProgress}
                            onBuffer={onBuffer}
                            onLoadStart={onLoadStart}
                            onLoad={onLoad}
                        />
                    </Animated.View>

                    {/* Hero Image with reanimated fade-out style */}
                    <AnimatedFastImage
                        source={{ uri: heroImage.uri }}
                        style={[styles.heroImage, imageAnimatedStyle]}
                        resizeMode={FastImage.resizeMode.cover}
                    />

                    {/* Overlay content (tags, play button, pagination dots) */}
                    <View style={styles.heroOverlay}>
                        {/* Genre tags */}
                        <View style={styles.tagsContainer}>
                            <Text style={styles.tag}>New</Text>
                            <Text style={styles.tag}>Detective</Text>
                            <Text style={styles.tag}>Crime</Text>
                        </View>

                        {/* Play Button */}
                        <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
                            <View style={styles.playButtonIcon}>
                                <Play stroke="#000" width={24} height={24} fill={'#000'} />
                            </View>
                            <Text style={styles.playButtonText}>Play</Text>
                        </TouchableOpacity>

                        {/* Pagination Dots */}
                        <View style={styles.paginationContainer}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>
                </View>

                {/* CONTINUE WATCHING SECTION */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Continue watching</Text>
                    <ChevronRight stroke={"#fff"} />
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 100 }}
                >
                    {continueWatchingData.map((item) => (
                        <View key={item.id} style={styles.cardContainer}>
                            <FastImage
                                source={{ uri: item.cover }}
                                style={styles.cardImage}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                            <Text style={styles.cardTitle}>{item.title}</Text>
                        </View>
                    ))}
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // dark background
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    searchIconWrapper: {
        position: 'absolute',
        zIndex: 1000,
        left: 16,
        top: 16,
        backgroundColor: '#00000070',
        height: 40,
        width: 40,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        bottom: 0,
    },

    /* HERO SECTION */
    heroContainer: {
        width: '100%',
        height: 500, // Adjust as needed
        marginBottom: 16,
        overflow: 'hidden', // Ensures children won't overlap out of bounds
    },
    absoluteFill: {
        ...StyleSheet.absoluteFillObject,
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
    },
    heroOverlay: {
        flex: 1,
        justifyContent: 'flex-end',

    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        marginHorizontal: "auto",
    },
    tag: {
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
        fontSize: 14,
    },
    playButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 20,
        marginHorizontal: "auto",
    },
    playButtonIcon: {
        marginRight: 10,
    },
    playButtonText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 16,
    },
    paginationContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#ff0000',
        width: 20,
    },

    /* CONTINUE WATCHING */
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 16,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    sectionLink: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '300',
    },
    cardContainer: {
        width: 120,
        marginLeft: 16,
        marginBottom: 16,
    },
    cardImage: {
        width: '100%',
        height: 180,
        borderRadius: 6,
        marginBottom: 8,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
});