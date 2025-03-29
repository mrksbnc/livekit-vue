import { useEnsureParticipant, useMaybeParticipantContext } from '@/context';
import { participantAttributesObserver } from '@livekit/components-core';
import type { Participant } from 'livekit-client';
import { ref, shallowRef, watchEffect, type Ref } from 'vue';

export type UseParticipantAttributesOptions = {
  participant?: Participant;
};

export type UseParticipantAttribute = {
  attribute: Ref<string | undefined>;
};

export type UseParticipantAttributes = {
  attributes: Ref<Readonly<Record<string, string>> | undefined>;
};

export function useParticipantAttribute(
  attributeKey: string,
  options: UseParticipantAttributesOptions = {},
): UseParticipantAttribute {
  const participant = useEnsureParticipant(options.participant);
  const attribute = ref<string | undefined>(participant.value?.attributes[attributeKey]);

  watchEffect((onCleanup) => {
    if (!participant.value) return;

    const observer = participantAttributesObserver(participant.value);
    if (!observer) return;

    const subscription = observer.subscribe({
      next: (attr) => {
        if (attr.changed[attributeKey] !== undefined) {
          attribute.value = attr.attributes[attributeKey];
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
  props: UseParticipantAttributesOptions = {},
): UseParticipantAttributes {
  const participantContext = useMaybeParticipantContext();
  const participant = props.participant ? shallowRef(props.participant) : participantContext;
  const attributes = ref<Readonly<Record<string, string>> | undefined>(
    participant?.value?.attributes,
  );

  watchEffect((onCleanup) => {
    if (!participant?.value) return;

    const observer = participantAttributesObserver(participant.value);
    if (!observer) return;

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
