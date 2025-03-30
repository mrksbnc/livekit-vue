import { useEnsureParticipant, useMaybeParticipantContext } from '@/context';
import { participantAttributesObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { ref, shallowRef, watchEffect, type Ref } from 'vue';

export type UseParticipantAttributesProps = {
  participant?: Participant;
  attributeKey?: string;
};

export type UseParticipantAttribute = {
  attribute: Ref<string | undefined>;
};

export type UseParticipantAttributes = {
  attributes: Ref<Readonly<Record<string, string>> | undefined>;
};

export function useParticipantAttribute(
  props: UseParticipantAttributesProps = {},
): UseParticipantAttribute {
  const participant = useEnsureParticipant(props.participant);
  const attribute = ref<string | undefined>(
    props.attributeKey ? participant.value?.attributes[props.attributeKey] : undefined,
  );

  watchEffect((onCleanup) => {
    if (!participant.value) {
      return;
    }

    const observer = participantAttributesObserver(participant.value);
    if (!observer) {
      return;
    }

    const subscription = observer.subscribe({
      next: (attr) => {
        if (props.attributeKey && attr.changed[props.attributeKey] !== undefined) {
          attribute.value = attr.attributes[props.attributeKey];
        }
      },
      error: (err) => {
        console.error('Error in attribute observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { attribute };
}

export function useParticipantAttributes(
  props: UseParticipantAttributesProps = {},
): UseParticipantAttributes {
  const participantContext = useMaybeParticipantContext();
  const participant = props.participant ? shallowRef(props.participant) : participantContext;
  const attributes = ref<Readonly<Record<string, string>> | undefined>(
    participant?.value?.attributes,
  );

  watchEffect((onCleanup) => {
    if (!participant?.value) {
      return;
    }

    const observer = participantAttributesObserver(participant.value);
    if (!observer) {
      return;
    }

    const subscription = observer.subscribe({
      next: (attr) => {
        attributes.value = attr.attributes;
      },
      error: (err) => {
        console.error('Error in attributes observer:', err);
      },
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return { attributes };
}
