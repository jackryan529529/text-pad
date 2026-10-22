import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Platform, Animated, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function App() {
    const insets = useSafeAreaInsets();
    const windowHeight = useWindowDimensions().height;
    
    // UI Theme Colors
    var PRIMARY_COLOR = '#345B63';
    var ACCENT_COLOR = '#E39A62';
    var BACKGROUND_COLOR = '#F1F5F2';
    var CARD_COLOR = '#FFFFFF';
    var TEXT_PRIMARY = '#203337';
    var TEXT_SECONDARY = '#607477';

    // Application States
    const [draft, setDraft] = useState('');
    const [submitted, setSubmitted] = useState('');
    const [loading, setLoading] = useState(false);
    const fade = useRef(new Animated.Value(1)).current;

    // The Gemini 1.5 Flash Fetch Request
    const submitText = async function() {
        var prompt = draft.trim();
        if (!prompt || loading) return;

        setLoading(true);
        setSubmitted('');

        // Free Gemini API Key from Google AI Studio
        var apiKey = 'AQ.Ab8RN6JCTK0pjoWLDZetcXPi9VjL6xxv0QgCRWEOIQ1rzhfhQQ'; 
        var endpoint = `https://googleapis.com{apiKey}`;

        try {
            var response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // The exact JSON payload requirement for Google Gemini
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) throw new Error('Request failed (' + response.status + ')');
            var result = await response.json();
            
            // Extract the generated text safely from Gemini's response structure
            var answer = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!answer) throw new Error('The API response did not contain a text answer.');

            fade.setValue(0);
            setSubmitted(String(answer));
            Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
        } catch (error) {
            fade.setValue(0);
            setSubmitted('Unable to get an AI response: ' + (error && error.message ? error.message : 'Request failed.'));
            Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.screen, { backgroundColor: BACKGROUND_COLOR }]}>
            <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />
            <ScrollView 
                contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
                    <Text style={styles.screenTitle}>Text Pad</Text>
                    <Text style={styles.headerSubtitle}>Give your words a little room to breathe.</Text>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.sectionLabel, { color: PRIMARY_COLOR }]}>DRAFT YOUR PROMPT</Text>
                    <View style={[styles.draftCard, { backgroundColor: CARD_COLOR }]}>
                        <TextInput
                            style={[styles.draftInput, { color: TEXT_PRIMARY }]}
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="What's on your mind?"
                            placeholderTextColor={TEXT_SECONDARY}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitButton, { backgroundColor: ACCENT_COLOR }]} 
                        onPress={submitText}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Submit to AI</Text>
                        )}
                    </TouchableOpacity>

                    {submitted ? (
                        <Animated.View style={{ opacity: fade, marginTop: 20 }}>
                            <Text style={[styles.sectionLabel, { color: PRIMARY_COLOR }]}>AI RESPONSE</Text>
                            <View style={[styles.responseCard, { backgroundColor: CARD_COLOR }]}>
                                <Text style={[styles.responseText, { color: TEXT_PRIMARY }]}>{submitted}</Text>
                            </View>
                        </Animated.View>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
}

// Wrap app inside SafeArea tracking context
export default function AppWrapper() {
    return (
        <SafeAreaProvider>
            <App />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: { padding: 24, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 14, color: '#E1EFEF', marginTop: 4 },
    content: { padding: 16 },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
    draftCard: { borderRadius: 12, padding: 12, minHeight: 120, borderWidth: 1, borderColor: '#B6C9C6', marginBottom: 16 },
    draftInput: { fontSize: 16, height: '100%' },
    submitButton: { borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#203337', fontSize: 16, fontWeight: 'bold' },
    responseCard: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#B6C9C6' },
    responseText: { fontSize: 16, lineHeight: 24 }
});
