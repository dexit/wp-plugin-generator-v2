<template>
  <div>
    <!-- ── Original sections ──────────────────────────────── -->
    <general />
    <advanced />
    <main-menu />
    <assets />
    <tables />

    <!-- ── New WP feature sections ───────────────────────── -->
    <cpt-section />
    <settings-section />
    <options-section />
    <meta-box-section />
    <rest-callbacks-section />
    <post-rest-fields-section />
    <user-fields-section />
    <term-fields-section />
    <quick-edit-section />
    <bulk-edit-section />
    <screen-options-section />
    <emails-section />
    <importers-section />
    <blocks-section />
  </div>
</template>

<script>
import General           from "./General";
import Advanced          from "./Advanced";
import MainMenu          from "./MainMenu";
import Assets            from "./Assets";
import Tables            from "./Table";

// New feature sections
import CptSection            from "./CPT";
import SettingsSection       from "./Settings";
import OptionsSection        from "./Options";
import MetaBoxSection        from "./MetaBox";
import RestCallbacksSection  from "./RestCallbacks";
import PostRestFieldsSection from "./PostRestFields";
import UserFieldsSection     from "./UserFields";
import TermFieldsSection     from "./TermFields";
import QuickEditSection      from "./QuickEdit";
import BulkEditSection       from "./BulkEdit";
import ScreenOptionsSection  from "./ScreenOptions";
import EmailsSection         from "./Emails";
import ImportersSection      from "./Importers";
import BlocksSection         from "./Blocks";

export default {
  components: {
    General,
    Advanced,
    MainMenu,
    Assets,
    Tables,
    CptSection,
    SettingsSection,
    OptionsSection,
    MetaBoxSection,
    RestCallbacksSection,
    PostRestFieldsSection,
    UserFieldsSection,
    TermFieldsSection,
    QuickEditSection,
    BulkEditSection,
    ScreenOptionsSection,
    EmailsSection,
    ImportersSection,
    BlocksSection,
  },
};
</script>

<style lang="scss" scoped></style>
