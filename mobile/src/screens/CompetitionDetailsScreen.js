import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { DEMO_COMPETITION_ID, DEMO_USER_ID } from '../constants/config';
import {
  getCompetition,
  getCompetitionWinners,
  getRegistrationStatus,
  registerForCompetition,
} from '../services/competitionService';

import Header from '../components/Header';
import CompetitionBadges from '../components/CompetitionBadges';
import CompetitionSummary from '../components/CompetitionSummary';
import JudgeCard from '../components/JudgeCard';
import CountdownTimer from '../components/CountdownTimer';
import ImportantDates from '../components/ImportantDates';
import RegistrationButton from '../components/RegistrationButton';
import PreviousWinners from '../components/PreviousWinners';
import CompetitionTabs from '../components/CompetitionTabs';
import RewardsSection from '../components/RewardsSection';
import DisclaimerSection from '../components/DisclaimerSection';
import SecurePaymentCard from '../components/SecurePaymentCard';
import ReferEarnCard from '../components/ReferEarnCard';
import TestimonialsSection from '../components/TestimonialsSection';
import UploadSubmissionButton from '../components/UploadSubmissionButton';
import BottomNavigation from '../components/BottomNavigation';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { mockTestimonials } from '../constants/mockTestimonials';
import { colors, spacing, fontSizes } from '../constants/theme';

export default function CompetitionDetailsScreen() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('about');
  const [activeNav, setActiveNav] = useState('competitions');
  const [registering, setRegistering] = useState(false);

  // Data from backend
  const [competition, setCompetition] = useState(null);
  const [winners, setWinners] = useState([]);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [comp, regStatus, fetchedWinners] = await Promise.all([
        getCompetition(DEMO_COMPETITION_ID),
        getRegistrationStatus(DEMO_COMPETITION_ID, DEMO_USER_ID),
        getCompetitionWinners(DEMO_COMPETITION_ID),
      ]);
      setCompetition(comp);
      setRegistered(regStatus?.registered ?? false);
      setWinners(fetchedWinners || []);
    } catch (err) {
      setError(err.message || 'Unable to load competition.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleRegister() {
    if (!competition || registered || registering) return;
    setRegistering(true);
    try {
      await registerForCompetition(DEMO_COMPETITION_ID, DEMO_USER_ID);
      // Re-fetch competition so bookedSpots/remainingSpots are authoritative.
      const [updatedComp, regStatus, updatedWinners] = await Promise.all([
        getCompetition(DEMO_COMPETITION_ID),
        getRegistrationStatus(DEMO_COMPETITION_ID, DEMO_USER_ID),
        getCompetitionWinners(DEMO_COMPETITION_ID),
      ]);
      setCompetition(updatedComp);
      setRegistered(regStatus?.registered ?? true);
      setWinners(updatedWinners || []);
    } catch (err) {
      const msg = friendlyRegistrationError(err);
      Alert.alert('Registration Failed', msg);
    } finally {
      setRegistering(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;
  if (!competition) return <ErrorState message="Competition data not found." onRetry={loadAll} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header
          registered={registered}
          onBack={() => {}}
          language={lang}
          onLanguageChange={setLang}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{competition.name}</Text>
            {registered ? <View style={styles.registeredPill}><Text style={styles.registeredPillText}>Registered</Text></View> : null}
            <CompetitionBadges category={competition.category} type={competition.type} />
            <CompetitionSummary competition={competition} />
          </View>

          {competition.judge ? <JudgeCard judge={competition.judge} /> : null}

          {competition.status === 'REGISTRATION_OPEN' && (
            <CountdownTimer deadline={competition.registrationDeadline} />
          )}

          <ImportantDates dates={competition.dates} />

          <RegistrationButton
            registered={registered}
            status={competition.status}
            entryFee={competition.entryFee}
            onRegister={handleRegister}
            loading={registering}
          />

          {/* Upload Submission — always visible; active only during SUBMISSION_OPEN */}
          <UploadSubmissionButton active={competition.status === 'SUBMISSION_OPEN'} />

          <PreviousWinners winners={winners} />

          <CompetitionTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            content={competition.content}
          />

          <RewardsSection rewards={competition.rewards} />

          <DisclaimerSection
            disclaimer={competition.content.disclaimer}
            refundPolicy={competition.content.refundPolicy}
          />

          <SecurePaymentCard />
          <ReferEarnCard />

          {/* Testimonials remain mock — backend has no testimonials endpoint */}
          <TestimonialsSection testimonials={mockTestimonials} />

          <View style={{ height: 32 }} />
        </ScrollView>

        <BottomNavigation active={activeNav} onChange={setActiveNav} />
      </View>
    </SafeAreaView>
  );
}

function friendlyRegistrationError(err) {
  const status = err?.statusCode;
  const msg = err?.message || '';
  if (status === 409 || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already')) {
    return 'You are already registered for this competition.';
  }
  if (msg.toLowerCase().includes('full') || msg.toLowerCase().includes('capacity')) {
    return 'This competition is now full. No spots remaining.';
  }
  if (msg.toLowerCase().includes('closed') || msg.toLowerCase().includes('deadline')) {
    return 'Registration has closed for this competition.';
  }
  if (msg.toLowerCase().includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  return msg || 'Registration failed. Please try again.';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  heroCard: {
    position: 'relative',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    lineHeight: 28,
  },
  registeredPill: { position: 'absolute', right: spacing.lg, top: spacing.lg, backgroundColor: colors.successLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  registeredPillText: { color: colors.success, fontSize: fontSizes.sm, fontWeight: '700' },
});
