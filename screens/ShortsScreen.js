import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Image, FlatList, TouchableOpacity, Text, Alert } from 'react-native';
import Video from 'react-native-video';
import { continueWatchingData } from '../data/constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

// Component that renders a single short video item
const ShortItem = ({ item, isActive, isPaused }) => {
    const [loading, setLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const videoRef = useRef(null);

    const onBuffer = ({ isBuffering }) => {
        console.log('Buffer event:', isBuffering);
        setIsBuffering(isBuffering);
    };

    useEffect(() => {
        if (item?.currentTime) {
            setTimeout(() => {
                videoRef?.current?.seek(item?.currentTime + 0.3);
            }, 1000);
        }
    }, [item?.currentTime]);

    return (
        <View style={styles.videoContainer}>
            <Video
                ref={videoRef}
                source={{
                    uri: item.videoUrl,
                    bufferConfig: {
                        minBufferMs: 15000,
                        maxBufferMs: 50000,
                        bufferForPlaybackMs: 2500,
                        bufferForPlaybackAfterRebufferMs: 5000,
                    },
                    minLoadRetryCount: 3,
                    minLoadRetryTime: 5000,
                }}
                style={styles.fullScreenVideo}
                resizeMode="cover"
                paused={!isActive || isPaused}
                muted={false}
                repeat={true}
                bufferingStrategy="Default"
                onBuffer={onBuffer}
                onLoadStart={() => setLoading(true)}
                onLoad={(data) => {
                    setLoading(false);
                }}
                onError={(error) => console.error('Video error:', error)}
            />

            {(loading || isBuffering) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                </View>
            )}

            {/* Movie details overlay (left-bottom) */}
            <View style={styles.detailsOverlay}>
                <Text style={styles.movieTitle}>{item.movieTitle || 'Title'}</Text>
                <Text style={styles.movieDescription}>{item.movieDescription || 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.'}</Text>
            </View>

            {/* Icons overlay (right-side column) */}
            <View style={styles.iconsOverlay}>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="heart" size={30} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="bookmark" size={30} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="share" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function ShortsScreen({ route }) {
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [videosData, setVideosData] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const flatListRef = useRef(null);

    // Add focus/blur handlers
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            // Pause all videos when leaving screen
            setIsPaused(true);
        });

        const focusSubscribe = navigation.addListener('focus', () => {
            // Resume video playback when returning to screen
            setIsPaused(false);
        });

        return () => {
            unsubscribe();
            focusSubscribe();
        };
    }, [navigation]);

    // Initialize videos data with hero video first
    useEffect(() => {
        if (route.params?.videoUrl) {
            const heroVideo = {
                id: 'hero-video',
                videoUrl: route.params.videoUrl,
                currentTime: route.params.currentTime || 0,
            };

            // Filter out the hero video from continueWatchingData if it exists
            const remainingVideos = continueWatchingData.filter(
                video => video.videoUrl !== route.params.videoUrl
            );

            // Combine hero video with remaining videos
            setVideosData([heroVideo, ...remainingVideos]);

        } else {
            setVideosData(continueWatchingData);
        }
    }, [route.params]);

    // Automatically scroll to the hero video (index 0) when route params change and videosData is updated
    useEffect(() => {
        if (route.params?.videoUrl && videosData.length > 0 && flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: 0, animated: true });
            setActiveIndex(0);
        }
    }, [videosData, route.params]);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

    return (
        <View style={styles.screen}>
            <FlatList
                ref={flatListRef}
                data={videosData}
                renderItem={({ item, index }) => (
                    <ShortItem
                        item={item}
                        isActive={index === activeIndex}
                        isPaused={isPaused}
                    />
                )}
                keyExtractor={(item) => item.id}
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={Dimensions.get('window').height}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                initialScrollIndex={0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'black',
    },
    videoContainer: {
        position: 'relative',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    fullScreenVideo: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    detailsOverlay: {
        position: 'absolute',
        bottom: 120,
        left: 10,
        right: 70,
        zIndex: 10,
    },
    movieTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    movieDescription: {
        color: '#fff',
        fontSize: 14,
    },
    iconsOverlay: {
        position: 'absolute',
        bottom: 100,
        right: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButton: {
        marginBottom: 25,
    },
}); 