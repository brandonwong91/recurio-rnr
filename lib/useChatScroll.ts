import { useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const useChatScroll = () => {
  const scrollViewRef = useRef<any>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback((animated = true) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated });
    }
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isScrolledToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    setIsAtBottom(isScrolledToBottom);
  };

  return {
    scrollViewRef,
    isAtBottom,
    scrollToBottom,
    handleScroll,
  };
};
