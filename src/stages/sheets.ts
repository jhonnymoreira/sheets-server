import { Stage, type StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import type { WithAppProps } from '@/shared/types/index.js';
import { StatefulStack, StatelessStack } from '@/stacks/index.js';

export type SheetsStageProps = WithAppProps<StageProps>;

export class SheetsStage extends Stage {
  constructor(scope: Construct, id: string, props: SheetsStageProps) {
    super(scope, id, props);

    new StatefulStack(this, 'stateful-stack', props);
    new StatelessStack(this, 'stateless-stack', props);
  }
}
