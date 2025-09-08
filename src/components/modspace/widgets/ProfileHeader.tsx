import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ModSpace } from '../../../types/modspace.types';
import { RootState } from '../../../store';
import { setEditMode } from '../../../store/modspaceSlice';
import { useOrientation } from '../../../utils/useOrientation';
import { useTheme } from '../../../contexts/ThemeContext';
import Icon from '../../common/Icon';

interface ProfileHeaderProps {
  modspace: ModSpace;
}

const { width: screenWidth } = Dimensions.get('window');

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ modspace }) => {
  const dispatch = useDispatch();
  const { isEditMode } = useSelector((state: RootState) => state.modspace);
  const { isPortrait } = useOrientation();
  const { currentTheme } = useTheme();

  const handleEditProfile = () => {
    dispatch(setEditMode(!isEditMode));
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const headerHeight = isPortrait ? 200 : 150;
  const avatarSize = isPortrait ? 100 : 80;
  
  // Create theme-aware styles
  const themedStyles = createThemedStyles(currentTheme);

  return (
    <View style={[themedStyles.container, { minHeight: headerHeight }]}>
      {/* Cover Image */}
      <ImageBackground
        source={modspace.coverImage ? { uri: modspace.coverImage } : undefined}
        style={[themedStyles.coverImage, { height: headerHeight * 0.6 }]}
        imageStyle={themedStyles.coverImageStyle}
      >
        {!modspace.coverImage && (
          <View style={[themedStyles.defaultCover, { height: headerHeight * 0.6 }]}>
            <Icon name="book" size={48} color="rgba(255, 255, 255, 0.8)" />
          </View>
        )}
        
        {/* Edit Button */}
        <TouchableOpacity 
          style={themedStyles.editButton}
          onPress={handleEditProfile}
        >
          <Icon 
            name={isEditMode ? 'check' : 'edit'} 
            size="sm" 
            color="white" 
          />
        </TouchableOpacity>
      </ImageBackground>

      {/* Profile Info */}
      <View style={[themedStyles.profileInfo, { paddingTop: avatarSize / 2 + 10 }]}>
        
        {/* Avatar */}
        <View style={[
          themedStyles.avatarContainer, 
          { 
            width: avatarSize, 
            height: avatarSize,
            top: -avatarSize / 2,
          }
        ]}>
          {modspace.avatar ? (
            <ImageBackground
              source={{ uri: modspace.avatar }}
              style={themedStyles.avatar}
              imageStyle={themedStyles.avatarImageStyle}
            />
          ) : (
            <View style={[themedStyles.defaultAvatar, { 
              width: avatarSize, 
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }]}>
              <Text style={[themedStyles.avatarText, { fontSize: avatarSize * 0.3 }]}>
                {getInitials(modspace.displayName)}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={themedStyles.userInfo}>
          <Text style={themedStyles.displayName}>{modspace.displayName}</Text>
          <Text style={themedStyles.username}>@{modspace.username}</Text>
          
          {modspace.bio && (
            <Text style={themedStyles.bio}>{modspace.bio}</Text>
          )}

          {/* Join Date & Last Active */}
          <View style={themedStyles.metaInfo}>
            <View style={themedStyles.metaItem}>
              <Icon name="calendar" size="xs" color={currentTheme.textColor} style={{ marginRight: 6, opacity: 0.6 }} />
              <Text style={themedStyles.metaText}>
                Joined {formatJoinDate(modspace.stats.joinDate)}
              </Text>
            </View>
            {modspace.privacy.showLastActive && (
              <View style={themedStyles.metaItem}>
                <Icon name="active" size="xs" color={currentTheme.successColor || '#34C759'} style={{ marginRight: 6 }} />
                <Text style={themedStyles.metaText}>
                  Active recently
                </Text>
              </View>
            )}
          </View>

          {/* Social Links */}
          {modspace.socialLinks.length > 0 && (
            <View style={themedStyles.socialLinksContainer}>
              {modspace.socialLinks
                .filter(link => link.isVisible)
                .slice(0, 3) // Show max 3 social links
                .map((link) => (
                  <TouchableOpacity 
                    key={link.id} 
                    style={themedStyles.socialLinkButton}
                  >
                    <View style={themedStyles.socialLinkContent}>
                      <Icon name={getSocialIconName(link.platform)} size="sm" color={currentTheme.textColor} style={{ marginRight: 4, opacity: 0.6 }} />
                      <Text style={themedStyles.socialLinkText}>
                        {link.displayName || link.platform}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </View>

      {/* Stats Section - Outside of profileInfo to span full width */}
      <View style={themedStyles.statsContainer}>
        <View style={themedStyles.statItem}>
          <Text style={themedStyles.statNumber}>
            {modspace.stats.totalEntries}
          </Text>
          <Text style={themedStyles.statLabel}>Entries</Text>
        </View>
        <View style={themedStyles.statItem}>
          <Text style={themedStyles.statNumber}>
            {modspace.stats.totalViews}
          </Text>
          <Text style={themedStyles.statLabel}>Views</Text>
        </View>
        <View style={themedStyles.statItem}>
          <Text style={themedStyles.statNumber}>
            {modspace.stats.followers}
          </Text>
          <Text style={themedStyles.statLabel}>Followers</Text>
        </View>
        <View style={themedStyles.statItem}>
          <Text style={themedStyles.statNumber}>
            {modspace.stats.following}
          </Text>
          <Text style={themedStyles.statLabel}>Following</Text>
        </View>
      </View>
    </View>
  );
};

// Helper function to get social platform icon names
const getSocialIconName = (platform: string) => {
  const iconNames: Record<string, any> = {
    instagram: 'instagram',
    twitter: 'twitter',
    tiktok: 'tiktok',
    youtube: 'youtube',
    website: 'website',
    other: 'link',
  };
  return iconNames[platform] || iconNames.other;
};

// Create theme-aware styles function
const createThemedStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.surfaceColor || theme.backgroundColor,
    width: '100%',
    overflow: 'hidden',
    shadowColor: theme.shadows?.color || '#000',
    shadowOffset: {
      width: 0,
      height: theme.shadows?.offset?.y || 4,
    },
    shadowOpacity: theme.shadows?.opacity || 0.1,
    shadowRadius: theme.shadows?.blur || 8,
    elevation: theme.shadows?.elevation || 5,
    marginBottom: theme.spacing?.sm || 8,
  },
  coverImage: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  coverImageStyle: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  defaultCover: {
    backgroundColor: theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    paddingHorizontal: theme.spacing?.md || 16,
    paddingBottom: theme.spacing?.lg || 20,
    position: 'relative',
  },
  avatarContainer: {
    position: 'absolute',
    left: theme.spacing?.md || 16,
    backgroundColor: theme.surfaceColor || theme.backgroundColor,
    borderRadius: 50,
    padding: 4,
    shadowColor: theme.shadows?.color || '#000',
    shadowOffset: {
      width: 0,
      height: theme.shadows?.offset?.y || 2,
    },
    shadowOpacity: theme.shadows?.opacity || 0.2,
    shadowRadius: theme.shadows?.blur || 4,
    elevation: theme.shadows?.elevation || 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarImageStyle: {
    borderRadius: 50,
  },
  defaultAvatar: {
    backgroundColor: theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.surfaceColor || 'white',
    fontWeight: '700',
  },
  userInfo: {
    marginLeft: 0,
    alignItems: 'flex-start',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textColor,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: theme.accentColor || theme.primaryColor,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: theme.textColor,
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 12,
  },
  metaInfo: {
    marginBottom: theme.spacing?.md || 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: theme.textColor,
    opacity: 0.6,
    marginBottom: 4,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing?.xs || 8,
  },
  socialLinkButton: {
    backgroundColor: theme.secondaryColor || theme.surfaceColor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius || 16,
  },
  socialLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLinkText: {
    fontSize: 12,
    color: theme.textColor,
    opacity: 0.8,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing?.xl || 32,
    paddingHorizontal: theme.spacing?.lg || 24,
    borderTopWidth: 1,
    borderTopColor: theme.textColor + '20', // 20% opacity
    backgroundColor: theme.secondaryColor || theme.surfaceColor,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textColor,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textColor,
    opacity: 0.6,
    marginTop: 4,
  },
});

export default ProfileHeader;