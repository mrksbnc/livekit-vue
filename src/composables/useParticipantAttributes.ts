import { useEnsureParticipant, useMaybeParticipantContext } from '@/context';
import { participantAttributesObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, ref, shallowRef, type ShallowRef } from 'vue';

export type UseParticipantAttributesOptions = {
  participant?: Participant;
};

export type AttributeObservable = Observable<{
  changed: Readonly<Record<string, string>>;
  attributes: Readonly<Record<string, string>>;
}>;

export function useParticipantAttributes(
  props: UseParticipantAttributesOptions = {},
): ShallowRef<Readonly<Record<string, string>> | undefined> {
  const participantContext = useMaybeParticipantContext();
  const p = shallowRef(props.participant) ?? participantContext?.value;

  const attributes = ref(p.value?.attributes);

  const attributeObserver = computed<AttributeObservable>(
    () =>
      (p.value
        ? participantAttributesObserver(p.value)
        : participantAttributesObserver(p.value)) as unknown as AttributeObservable,
  );

  useSubscription(
    attributeObserver.value.subscribe((attr) => {
      attributes.value = attr.attributes;
    }),
  );

  return attributes;
}

export function useParticipantAttribute(
  attributeKey: string,
  options: UseParticipantAttributesOptions = {},
): ShallowRef<string | undefined> {
  const p = useEnsureParticipant(options.participant);
  const attribute = ref(p.value?.attributes[attributeKey]);

  useSubscription(
    participantAttributesObserver(p.value).subscribe((attr) => {
      if (attr.changed[attributeKey] !== undefined) {
        attribute.value = attr.attributes[attributeKey];
      }
    }),
  );

  return attribute;
}
