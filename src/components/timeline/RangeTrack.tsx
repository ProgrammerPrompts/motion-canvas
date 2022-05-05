import styles from './Timeline.module.scss';

import {useDrag, usePlayer, usePlayerState} from '../../hooks';
import {useCallback, useContext, useEffect, useState} from 'preact/hooks';
import {Icon, IconType} from '../controls';
import {TimelineContext} from './TimelineContext';

export function RangeTrack() {
  const {fullLength} = useContext(TimelineContext);

  const player = usePlayer();
  const state = usePlayerState();
  const [start, setStart] = useState(state.startFrame);
  const [end, setEnd] = useState(state.endFrame);

  const onDrop = useCallback(() => {
    const correctedStart = Math.max(0, Math.floor(start));
    const correctedEnd =
      end >= state.duration
        ? Infinity
        : Math.min(state.duration, Math.floor(end));
    setStart(correctedStart);
    setEnd(correctedEnd);

    player.updateState({
      startFrame: correctedStart,
      endFrame: correctedEnd,
    });
  }, [start, end]);

  const [handleDragStart] = useDrag(
    useCallback(
      dx => {
        setStart(start + (dx / fullLength) * state.duration);
      },
      [start, setStart, fullLength, state.duration],
    ),
    onDrop,
  );

  const [handleDragEnd] = useDrag(
    useCallback(
      dx => {
        setEnd(
          Math.min(state.duration, end) + (dx / fullLength) * state.duration,
        );
      },
      [end, setEnd, fullLength, state.duration],
    ),
    onDrop,
  );

  const [handleDrag] = useDrag(
    useCallback(
      dx => {
        setStart(start + (dx / fullLength) * state.duration);
        setEnd(
          Math.min(state.duration, end) + (dx / fullLength) * state.duration,
        );
      },
      [start, end, fullLength, state.duration, setStart, setEnd],
    ),
    onDrop,
  );

  useEffect(() => {
    setStart(state.startFrame);
    setEnd(state.endFrame);
  }, [state.startFrame, state.endFrame]);

  return (
    <div
      style={{
        left: `${(Math.max(0, start) / state.duration) * 100}%`,
        right: `${100 - Math.min(1, (end + 1) / state.duration) * 100}%`,
      }}
      className={styles.range}
      onMouseDown={event => {
        if (event.button === 1) {
          event.preventDefault();
          setStart(0);
          setEnd(Infinity);
        } else {
          handleDrag(event);
        }
      }}
    >
      <Icon
        onMouseDown={handleDragStart}
        className={styles.handle}
        type={IconType.dragIndicator}
      />
      <Icon
        onMouseDown={handleDragEnd}
        onDblClick={console.log}
        className={styles.handle}
        type={IconType.dragIndicator}
      />
    </div>
  );
}
