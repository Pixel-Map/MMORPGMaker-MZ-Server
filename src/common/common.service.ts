import { Injectable, Logger } from '@nestjs/common';
import { GlobalSwitchRepository } from './globalSwitch.entity';
import { MikroORM, UseRequestContext } from '@mikro-orm/core';
import { GlobalVariableRepository } from './globalVariable.entity';

@Injectable()
export class CommonService {
  globalSwitches: Map<number, boolean>;
  globalVariables: Map<number, unknown>;
  private readonly logger = new Logger(CommonService.name);

  constructor(
    private readonly globalSwitchRepo: GlobalSwitchRepository,
    private readonly globalVariableRepo: GlobalVariableRepository,
    private readonly orm: MikroORM,
  ) {
    this.globalSwitches = new Map();
    this.globalVariables = new Map();

    this.reloadGlobalSwitches().then(() =>
      this.logger.log('Successfully loaded global switches'),
    );
    this.reloadGlobalVariables().then(() =>
      this.logger.log('Successfully loaded global variables'),
    );
  }

  // Global Switches
  @UseRequestContext()
  async reloadGlobalSwitches() {
    const globalSwitchesFromDB = await this.globalSwitchRepo.findAll();
    for (const globalSwitch of globalSwitchesFromDB) {
      this.globalSwitches.set(globalSwitch.id, globalSwitch.value);
    }
  }

  getGlobalSwitches(): Map<number, boolean> {
    return this.globalSwitches;
  }

  // Global Variables
  @UseRequestContext()
  async reloadGlobalVariables() {
    const globalVariablesFromDB = await this.globalVariableRepo.findAll();
    for (const globalVariable of globalVariablesFromDB) {
      this.globalVariables.set(globalVariable.id, globalVariable.value);
    }
  }

  getGlobalVariables(): Map<number, unknown> {
    return this.globalVariables;
  }
}
