import type { ImageURISource } from 'react-native';
import type { RootScreenProps } from '@/navigation/types';
import type { Chapter, Project } from '@/state/defaults';

import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  createFile,
  hasPermission,
  listFiles,
  readFile,
  rename,
} from 'react-native-saf-x';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import PlaceholderImage from '@/theme/assets/images/placeholder_book_cover.png';
import { Paths } from '@/navigation/paths';

import { TitleBar } from '@/components/atoms';
import BounceLoader from '@/components/atoms/BounceLoader/BounceLoader';
import ContentCreator from '@/components/molecules/ContentCreator/ContentCreator';
import { ChaptersDynamicList } from '@/components/organisms/ChaptersDynamicList/ChaptersDynamicList';

import {
  HomeFolderStateAtom,
  LanguageStateAtom,
  ProjectsDataStateAtom,
  SaveAtomEffect,
} from '@/state/atoms/persistentContent';
import { ChapterStatusType, getValidChapterEnum } from '@/state/defaults';
import {
  findChapterByTitleAndPath,
  getChapterById,
  getProjectById,
  updateChapterValue,
} from '@/utils/chapterHelpers';
import {
  arraysAreEqualAndNonEmpty,
  countParagraphs,
  createNewUUID,
  formatTimestamp,
  minimizeMarkdownTextLength,
  removeFileExtension,
  updateLastSegment,
} from '@/utils/common';
import { print } from '@/utils/logger';
import { findProjectById, getSupportFile } from '@/utils/projectHelpers';

function ChaptersView({
  navigation,
  route,
}: RootScreenProps<Paths.ChaptersView>) {
  useAtom(SaveAtomEffect);

  const { t } = useTranslation();
  const { projectId } = route.params;
  const { colors, fonts, gutters, layout } = useTheme();

  const IMG_HEIGHT = 180 - 52;

  const styles = StyleSheet.create({
    image: {
      filter: 'brightness(0.8), saturate(0.2)',
      height: IMG_HEIGHT,
      resizeMode: 'cover',
      width: '100%',
    },
    imageContainer: {
      height: IMG_HEIGHT,
      marginBottom: 24,
      overflow: 'hidden',
    },
    overlay: {
      alignItems: 'flex-start',
    },
    overlayText: {
      color: colors.light,
    },
  });

  const language = useAtomValue(LanguageStateAtom);
  const homeFolder = useAtomValue(HomeFolderStateAtom);

  const [allProjects, setAllProjects] = useAtom(ProjectsDataStateAtom);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(true);
  const [allChaptersSorted, setAllChaptersSorted] = useState<Chapter[]>([]);
  const [imageToLoad, setImageToLoad] =
    useState<ImageURISource>(PlaceholderImage);

  const [lastChapterViewed, setLastChapterViewed] = useState<string>('');
  const [projectWordCount, setProjectWordCount] = useState<number>(0);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectUpdatedOn, setProjectUpdatedOn] = useState<string>('');
  const [isEditingChapterTitle, setIsEditingChapterTitle] =
    useState<string>('');

  type NavigateObject = {
    chapterId?: string;
    willNavigate: string;
  };
  const [navigateObject, setNavigateObject] = useState<NavigateObject>({
    willNavigate: '',
  });

  const updateChaptersById = (id: string, newChapters: Chapter[]) => {
    setAllProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, chapters: newChapters } : project,
      ),
    );
  };

  useEffect(() => {
    // Check if the object has been updated with specific key-value pairs
    if (navigateObject.willNavigate !== '') {
      if (navigateObject.willNavigate === 'back') {
        navigation.navigate(Paths.ProjectsView);
      } else {
        if (
          navigateObject.willNavigate === 'forward' &&
          navigateObject.chapterId
        ) {
          navigation.navigate(Paths.ContentView, {
            chapterId: navigateObject.chapterId,
            projectId,
          });
        }
      }
    }
  }, [navigateObject, navigation]);

  const onNavigateBack = () => {
    updateChaptersById(projectId, allChaptersSorted);
    setNavigateObject({
      willNavigate: 'back',
    });
  };

  const onNavigate = (chapterId: string) => {
    updateChaptersById(projectId, allChaptersSorted);
    setNavigateObject({
      chapterId,
      willNavigate: 'forward',
    });
  };

  const updateChaptersStatus = (
    projectId: string,
    chapterId: string,
    newStatus: string,
  ) => {
    const validEnum = getValidChapterEnum(newStatus);
    setAllProjects((prevState) =>
      prevState.map((book) =>
        book.id === projectId
          ? {
              ...book,
              chapters: book.chapters.map((chapter) =>
                chapter.id === chapterId
                  ? {
                      ...chapter,
                      status: validEnum,
                    }
                  : chapter,
              ),
            }
          : book,
      ),
    );
    setLoadingChapters(true);
  };

  const changeChapterTitle = (chapterId: string, newTitle: string) => {
    const chapterContent = getChapterById(projectId, chapterId, allProjects);
    if (chapterContent) {
      (async () => {
        try {
          if (chapterContent.title !== newTitle) {
            const fileRenamed = await rename(
              chapterContent.androidFilePath,
              `${newTitle}.md`,
            );
            if (fileRenamed) {
              const newAndroidPath = updateLastSegment(
                chapterContent.androidFilePath,
                `${newTitle}.md`,
              );
              updateChapterValue(setAllProjects, projectId, chapterId, {
                androidFilePath: newAndroidPath,
              });
              Toast.show({
                text1: t('screen_chapters.chapter_renamed.text1'),
                text2: t('screen_chapters.chapter_renamed.text2'),
                type: 'success',
              });
            } else {
              Toast.show({
                text1: t('screen_chapters.chapter_not_renamed.text1'),
                text2: t('screen_chapters.chapter_not_renamed.text2'),
                type: 'error',
              });
            }
          }
        } catch (error) {
          print(error);
        } finally {
          setLoadingChapters(true);
        }
      })();
    }
  };

  useEffect(() => {
    const fetchAllChapters = async () => {
      try {
        if (loadingChapters) {
          const allProjectsFromFile: Project[] =
            await getSupportFile(homeFolder);
          const selectedProject: Project | undefined = getProjectById(
            projectId,
            allProjectsFromFile,
          );
          if (selectedProject) {
            const imageURI = `${homeFolder}/.scriptura/covers/${selectedProject.coverPath}`;
            const __hasPermission = await hasPermission(imageURI);
            if (__hasPermission) {
              const base64String = await readFile(imageURI, {
                encoding: 'base64',
              });
              if (base64String.trim().length > 0) {
                setImageToLoad({
                  uri: `data:image/png;base64,${base64String}`,
                });
              }
            }
            const __allExternalStorageProjectFiles = await listFiles(
              selectedProject.androidFolderPath,
            );
            // Remove everything that's not a Markdown
            const allExternalStorageProjectFiles =
              __allExternalStorageProjectFiles.filter(
                (item) => item.mime === 'text/markdown',
              );
            // Get Data from all chapters
            const allChaptersData: Chapter[] = [];
            let totalWordCount = 0;
            let totalSentencesCount = 0;
            let latestUpdateInProject = 0;
            let latestUpdateInProjectId = '';
            for (const chapter of allExternalStorageProjectFiles) {
              const chapterFileContent: string = await readFile(chapter.uri);
              const chapterFileTitle: string =
                removeFileExtension(chapter.name) ??
                t('screen_chapters.no_title');

              const markdownWordCount =
                minimizeMarkdownTextLength(chapterFileContent);
              const markdownSentenceCount = countParagraphs(chapterFileContent);

              const savedChapter = findChapterByTitleAndPath(
                selectedProject.chapters,
                chapterFileTitle,
                chapter.uri,
              );

              const __defineNewChapter: Chapter = savedChapter
                ? {
                    ...savedChapter,
                    lastUpdate: chapter.lastModified,
                    sentencesCount: markdownSentenceCount,
                    wordCount: markdownWordCount,
                  }
                : {
                    androidFilePath: chapter.uri,
                    id: createNewUUID(),
                    iphoneFilePath: '',
                    lastUpdate: chapter.lastModified,
                    linuxFilePath: '',
                    osxFilePath: '',
                    revisionPosition: -1,
                    sentencesCount: markdownSentenceCount,
                    status: ChapterStatusType.Undefined,
                    title: chapterFileTitle,
                    windowsFilePath: '',
                    wordCount: markdownWordCount,
                  };
              totalWordCount += markdownWordCount;
              totalSentencesCount += markdownSentenceCount;
              if (__defineNewChapter.lastUpdate > latestUpdateInProject) {
                latestUpdateInProject = __defineNewChapter.lastUpdate;
                latestUpdateInProjectId = __defineNewChapter.id;
              }
              allChaptersData.push(__defineNewChapter);
            }
            setAllProjects((prevProjects) =>
              prevProjects.map((project) =>
                project.id === projectId
                  ? {
                      ...project,
                      chapterLastViewed: latestUpdateInProjectId,
                      chapters: allChaptersData,
                      lastUpdate: latestUpdateInProject,
                      sentencesCount: totalSentencesCount,
                      wordCount: totalWordCount,
                    }
                  : project,
              ),
            );
            setProjectWordCount(totalWordCount);
            setProjectTitle(selectedProject.title);
            setProjectUpdatedOn(
              formatTimestamp(latestUpdateInProject, language),
            );
          }
        }
      } catch (error) {
        print(error);
      } finally {
        setLoadingChapters(false);
      }
    };
    void fetchAllChapters();
  }, [loadingChapters]);

  useEffect(() => {
    if (allChaptersSorted.length > 0) {
      const orderedIds = allChaptersSorted.map((chapter) => chapter.id);
      const actualProject = findProjectById(allProjects, projectId);
      if (actualProject) {
        const alreadyUpdated = arraysAreEqualAndNonEmpty(
          actualProject.chapterSort,
          orderedIds,
        );
        if (!alreadyUpdated) {
          setAllProjects((prevProjects) =>
            prevProjects.map((project) =>
              project.id === projectId
                ? { ...project, chapterSort: orderedIds }
                : project,
            ),
          );
        }
      }
    }
  }, [allChaptersSorted]);

  useEffect(() => {
    const selectedProject = findProjectById(allProjects, projectId);
    if (selectedProject) {
      const updatedChapters = selectedProject.chapters;
      setLastChapterViewed(selectedProject.chapterLastViewed);

      let chapterSort = selectedProject.chapterSort;
      if (chapterSort.length === 0) {
        chapterSort = updatedChapters.map((chapter) => chapter.id);
      }

      const orderMap = new Map(chapterSort.map((id, index) => [id, index]));
      const sortedArray = [...updatedChapters].sort((a, b) => {
        return (
          (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity)
        );
      });
      setAllChaptersSorted(sortedArray);
      setLoadingChapters(false);
    }
  }, [allProjects, projectId]);

  const createChapterFile = async (chapterName: string) => {
    try {
      const selectedProject: Project | undefined = getProjectById(
        projectId,
        allProjects,
      );
      if (selectedProject) {
        const newChapterFile = `${selectedProject.androidFolderPath}/${chapterName}.md`;
        await createFile(newChapterFile);
        setLoadingChapters(true);
      }
      Toast.show({
        text1: t('creating_file_success.text1'),
        text2: t('creating_file_success.text2'),
        type: 'success',
      });
    } catch (error) {
      Toast.show({
        text1: t('creating_file_error.text1'),
        text2: t('creating_file_error.text2'),
        type: 'error',
      });
      print(error);
    }
  };

  return (
    <View style={[gutters.marginTop_16]}>
      {loadingChapters ? (
        <View>
          <View>
            <TitleBar onNavigateBack={onNavigateBack} title={projectTitle} />
          </View>
          <View style={styles.imageContainer}>
            <Image source={PlaceholderImage} style={[styles.image]} />
          </View>
          <BounceLoader
            animationDuration={800}
            bounceHeight={20}
            color={colors.gray800}
            dotCount={3}
            size={14}
            staggerDelay={200}
          />
        </View>
      ) : allChaptersSorted.length > 0 ? (
        <ChaptersDynamicList
          allChaptersSorted={allChaptersSorted}
          changeChapterTitle={changeChapterTitle}
          footerAction={createChapterFile}
          isEditingChapterTitle={isEditingChapterTitle}
          lastChapterViewed={lastChapterViewed}
          onNavigate={onNavigate}
          onNavigateBack={onNavigateBack}
          parallaxImage={imageToLoad}
          parallaxSubtitle={`${t('screen_chapters.updated_at')} ${projectUpdatedOn}`}
          parallaxTitle={projectTitle}
          projectId={projectId}
          projectWordCount={projectWordCount}
          setAllChaptersSorted={setAllChaptersSorted}
          setIsEditingChapterTitle={setIsEditingChapterTitle}
          triggerUpdate={setLoadingChapters}
          updateChaptersStatus={updateChaptersStatus}
        />
      ) : (
        <View style={[gutters.marginTop_4, gutters.marginVertical_20]}>
          <View>
            <View>
              <TitleBar onNavigateBack={onNavigateBack} title={projectTitle} />
            </View>
            <View style={styles.imageContainer}>
              <Image source={PlaceholderImage} style={[styles.image]} />
            </View>
            <Text
              style={[
                gutters.marginHorizontal_32,
                fonts.size_20,
                fonts.gray400,
                fonts.defaultFontFamilyBold,
              ]}
            >
              {t('screen_chapters.no_chapters')}
            </Text>
          </View>
        </View>
      )}
      <View style={[layout.itemsCenter, layout.fullWidth, gutters.marginTop_4]}>
        {!loadingChapters && (
          <ContentCreator
            createContent={createChapterFile}
            subtitle={t('screen_chapters.file_name')}
            title={t('screen_chapters.create_file')}
          />
        )}
      </View>
    </View>
  );
}

export default ChaptersView;
