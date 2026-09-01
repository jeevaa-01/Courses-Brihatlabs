// Register components globally so course pages can use them without imports.
import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Quiz from '@site/src/components/Quiz';
import {
  LearningObjectives,
  KeyTakeaways,
  DurationBadge,
  LessonComplete,
} from '@site/src/components/Course';

export default {
  ...MDXComponents,
  Tabs,
  TabItem,
  Quiz,
  LearningObjectives,
  KeyTakeaways,
  DurationBadge,
  LessonComplete,
};
