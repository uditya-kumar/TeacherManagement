import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState } from 'react'
import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'
import CustomTextInput from '@/components/teacherManagement/CustomTextInput'
import CustomButton from '@/components/teacherManagement/Button'
import { useAuth } from '@/providers/AuthProvider'
import { useSubmitBugReport } from '@/api/teachers/reportBug'
import { router } from 'expo-router'
import { showToast } from '@/libs/toastService'

const ReportBug = () => {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { profile } = useAuth();
  const { mutate: submitBug, isPending } = useSubmitBugReport(profile?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [browser, setBrowser] = useState('');
  const [error, setError] = useState('');

  const onSubmit = () => {
    setError('');
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    submitBug(
      {
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: steps.trim() || undefined,
        expected_behavior: expected.trim() || undefined,
        actual_behavior: actual.trim() || undefined,
        browser_info: browser.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.back();
          setTimeout(() => {
            showToast('Bug reported successfully', 2500);
          }, 200);
        },
        onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
      }
    );
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0} // adjust if you have a header
  >
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
      <CustomTextInput value={title} onChangeText={setTitle} placeholder="Short summary" />

      <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
      <CustomTextInput value={description} onChangeText={setDescription} placeholder="Describe the issue" />

      <Text style={[styles.label, { color: colors.text }]}>Steps to Reproduce</Text>
      <CustomTextInput value={steps} onChangeText={setSteps} placeholder="1. ... 2. ..." />

      <Text style={[styles.label, { color: colors.text }]}>Expected Behavior</Text>
      <CustomTextInput value={expected} onChangeText={setExpected} placeholder="What you expected to happen" />

      <Text style={[styles.label, { color: colors.text }]}>Actual Behavior</Text>
      <CustomTextInput value={actual} onChangeText={setActual} placeholder="What actually happened" />

      <Text style={[styles.label, { color: colors.text }]}>Device Info</Text>
      <CustomTextInput value={browser} onChangeText={setBrowser} placeholder="OS, device model, browser, etc." />

      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

      <View style={{ marginHorizontal: 15, marginTop: 15 }}>
        <CustomButton
          text="Submit Bug"
          textColor="#FFFFFF"
          backgroundColor={isDark ? '#374151' : '#0C1120'}
          onPress={onSubmit}
          paddingVertical={13}
          loading={isPending}
        />
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 25,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: -8,
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ReportBug