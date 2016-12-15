<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:fn="http://www.w3.org/2005/xpath-functions">
    <!--
     
        This file transforms an Entity schema into mysql ddl
         
    -->
    <xsl:output media-type="text/sql" omit-xml-declaration="yes"/>

    <xsl:template match="/">
        <xsl:apply-templates select="/Entities"/>
    </xsl:template>

    
    
    <xsl:template match="/Entities">
        --
        -- @schema: <xsl:value-of select="@name"/>
        --
        DELIMITER $$
        DROP DATABASE IF EXISTS <xsl:value-of select="@name"/>;
        CREATE DATABASE <xsl:value-of select="@name"/>;

        -- SET FOREIGN_KEY_CHECKS=0;

        USE <xsl:value-of select="@name"/>;

        <xsl:apply-templates select="./Entity">
            <xsl:with-param name="schema" select="@name"/>
        </xsl:apply-templates>

        <xsl:for-each select="/Entities/Entity">

        ALTER TABLE `<xsl:value-of select="@name"/>` ADD CONSTRAINT `fk_<xsl:value-of select="@name"/>_CreatedByMember` FOREIGN KEY (_creator) REFERENCES `<xsl:value-of select="/Entities/@name" />`.`Member`(`_id`);
        ALTER TABLE `<xsl:value-of select="@name"/>` ADD CONSTRAINT `fk_<xsl:value-of select="@name"/>_ModifiedByMember` FOREIGN KEY (_modifier) REFERENCES `<xsl:value-of select="/Entities/@name" />`.`Member`(`_id`);

        </xsl:for-each>


        <xsl:for-each select="./Entity/Property[@indexed='true']">
            CREATE INDEX `ix_<xsl:value-of
                select="../@name"/>_<xsl:value-of select="@name"/>` ON `<xsl:value-of
                select="../@name"/>`(`<xsl:value-of select="@name"/>`);

        </xsl:for-each>
        <xsl:for-each select="./Entity/Property[@unique='true']">
            CREATE UNIQUE INDEX `ux_<xsl:value-of
                select="../@name"/>_<xsl:value-of select="@name"/>` ON `<xsl:value-of
                select="../@name"/>`(`<xsl:value-of select="@name"/>`);

        </xsl:for-each>
        <xsl:for-each select="./Entity/Index">
            CREATE INDEX `<xsl:value-of
                select="@name"/>` ON `<xsl:value-of
                select="../@name"/>`(<xsl:for-each select="Field"><xsl:if test="position() != 1">,</xsl:if>`<xsl:value-of select="@name"/>`</xsl:for-each>);

        </xsl:for-each>

        <xsl:for-each select="./Entity/Relation">
            <xsl:call-template name="tpl-relation-constraint">
                <xsl:with-param name="relation" select="."/>
            </xsl:call-template>
        </xsl:for-each>

        <!--<xsl:for-each select="./Entity">-->
            <!--<xsl:call-template name="tpl-create-functions" />-->
        <!--</xsl:for-each>-->

        <xsl:for-each select="./Entity">
            <xsl:call-template name="tpl-detail-procedures" />
        </xsl:for-each>
    </xsl:template>


    <xsl:template match="/Entities/Entity">
        <xsl:param name="schema"/>
        <xsl:if test="not(@abstract) or ./@abstract!='true'">

    --
    -- Schema definition for <xsl:value-of select="$schema"/>.<xsl:value-of select="@name"/>
    --
    CREATE TABLE `<xsl:value-of select="@name"/>` (
         `_id` BIGINT UNSIGNED NOT NULL UNIQUE AUTO_INCREMENT
        ,`_creator` BIGINT UNSIGNED
        ,`_modifier` BIGINT UNSIGNED
        ,`_created` DATETIME
        ,`_modified` DATETIME

        <xsl:for-each select="Property">
        ,`<xsl:value-of select="@name"/>` <xsl:call-template name="tpl-property-storageType">
            <xsl:with-param name="type" select="@storageType"/></xsl:call-template> 
            <xsl:choose>
                <xsl:when test="@required = 'true'"> NOT NULL</xsl:when>
            </xsl:choose> COMMENT '{storage: "<xsl:value-of select="@storageType"/>"}' </xsl:for-each>
        <xsl:for-each select="Relation"><xsl:call-template name="tpl-relation-column">
                <xsl:with-param name="relation" select="."/></xsl:call-template>
        </xsl:for-each>
        ,PRIMARY KEY(`_id`)
    ) Engine=InnoDB CHARSET=UTF8;
    $$

    CREATE TABLE `<xsl:value-of select="@name"/>_Log` (
        `_id` BIGINT UNSIGNED NOT NULL
        <xsl:for-each select="Property">
            ,`<xsl:value-of select="@name"/>` <xsl:call-template name="tpl-property-storageType">
            <xsl:with-param name="type" select="@storageType"/></xsl:call-template>
            <xsl:choose>
                <xsl:when test="@required = 'true'"> NOT NULL</xsl:when>
            </xsl:choose> COMMENT '{storage: "<xsl:value-of select="@storageType"/>"}' </xsl:for-each>
        <xsl:for-each select="Relation"><xsl:call-template name="tpl-relation-column">
            <xsl:with-param name="relation" select="."/></xsl:call-template>
        </xsl:for-each>
        ,`_when` DATETIME NOT NULL
        ,`_msec` INT NULL
        ,PRIMARY KEY(`_id`)
    ) Engine=InnoDB CHARSET=UTF8;
    $$

    --
    -- History keeping for the `<xsl:value-of select="@name" />` table
    --
    CREATE TRIGGER `trg_<xsl:value-of select="@name" />_changed`
        BEFORE UPDATE
        ON `<xsl:value-of select="/Entities/@name" />`.`<xsl:value-of select="@name" />`
        FOR EACH ROW
        BEGIN
            INSERT INTO `<xsl:value-of select="@name"/>_Log` (
                `_id`,
                <xsl:for-each select="Property">`<xsl:value-of select="@name" />`,
                </xsl:for-each>
                <xsl:for-each select="Relation">`<xsl:value-of select="@name" />`,
                </xsl:for-each>
                `_when`,
                `_msec`
            ) VALUES (
                OLD._id,
                <xsl:for-each select="Property">OLD.`<xsl:value-of select="@name" />`,
                </xsl:for-each>
                <xsl:for-each select="Relation[@type='hasOne']">OLD.`_<xsl:value-of select="@name" />`,
                </xsl:for-each>
                CURRENT_TIMESTAMP(),
                MICROSECOND(CURRENT_TIMESTAMP(6))
            );
        END;
        $$
        </xsl:if>
    </xsl:template>

    <!--
        Template to determine mysql storage type for declared @storageType.
    -->
    <xsl:template name="tpl-property-storageType">
        <xsl:param name="type"/>
        <xsl:choose>
            <xsl:when test="$type = 'red.MBString'">TEXT</xsl:when>
            <xsl:when test="$type = 'red.DateTime'">DATETIME</xsl:when>
            <xsl:when test="$type = 'red.Date'">DATE</xsl:when>
            <xsl:when test="$type = 'red.Time'">TIME</xsl:when>

            <xsl:when test="$type = 'Integer'">INT</xsl:when>
            <xsl:when test="$type = 'Int'">INT</xsl:when>
            <xsl:when test="$type = 'BigInteger'">BIGINT</xsl:when>
            <xsl:when test="$type = 'BigInt'">BIGINT</xsl:when>

            <xsl:when test="$type = 'MBString'">TEXT</xsl:when>
            <xsl:when test="$type = 'DateTime'">DATETIME</xsl:when>
            <xsl:when test="$type = 'Date'">DATE</xsl:when>
            <xsl:when test="$type = 'Time'">TIME</xsl:when>
            <xsl:when test="$type = 'GUID'">CHAR(36)</xsl:when>

            <xsl:otherwise><xsl:value-of select="$type" /></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!--
        Template to inject a column for a relation
    -->
    <xsl:template name="tpl-relation-column">
        <xsl:param name="relation"/>

        <xsl:choose>
            <xsl:when test="$relation/@type = 'hasOne'">
        ,`_<xsl:value-of select="$relation/@name"/>` BIGINT UNSIGNED</xsl:when>
        </xsl:choose>
        <xsl:choose>
            <xsl:when test="$relation/@required = 'true'"> NOT NULL</xsl:when>
        </xsl:choose>
    </xsl:template>

    <!--
        Template to inject a foreign key for a relation
    -->
    <xsl:template name="tpl-relation-constraint">
        <xsl:param name="relation"/>

        <xsl:choose>
            <xsl:when test="$relation/@type = 'hasOne' or $relation/@type=''">
                ALTER TABLE `<xsl:value-of select="../@name"/>` ADD CONSTRAINT `fk_<xsl:value-of
                    select="../@name"/>_<xsl:value-of select="$relation/@name"/>` FOREIGN KEY (`_<xsl:value-of
                    select="$relation/@name"/>`) REFERENCES `<xsl:value-of select="/Entities/@name" />`.`<xsl:value-of
                    select="$relation/@toEntity"/>`(`_id`);
            </xsl:when>
            <xsl:when test="$relation/@type = 'hasMany'">
                CREATE TABLE `<xsl:value-of select="../@name"/>_has_<xsl:value-of
                    select="$relation/@name"/>` (
                `parent_id` BIGINT UNSIGNED NOT NULL
                ,`child_id` BIGINT UNSIGNED NOT NULL
                ,`sequence` INT NULL
                ,PRIMARY KEY(`parent_id`, `child_id`)
                ,CONSTRAINT `fk_parent_<xsl:value-of select="../@name"/>_has_<xsl:value-of
                    select="$relation/@name"/>` FOREIGN KEY (`parent_id`) REFERENCES `<xsl:value-of select="/Entities/@name" />`.`<xsl:value-of select="../@name"/>`(`_id`)
                ,CONSTRAINT `fk_child_<xsl:value-of select="../@name"/>_has_<xsl:value-of
                    select="$relation/@name"/>` FOREIGN KEY (`child_id`) REFERENCES `<xsl:value-of select="/Entities/@name" />`.`<xsl:value-of
                    select="$relation/@toEntity"/>`(`_id`)
                ) Engine=InnoDB CHARSET=UTF8;
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="tpl-create-functions">

        CREATE FUNCTION fnCreate<xsl:value-of select="@name" />
        (
            <xsl:for-each select="Property">
                <xsl:if test="position() != 1">, </xsl:if>p<xsl:value-of select="@name" /><xsl:value-of select="' '" /><xsl:call-template name="tpl-property-storageType"><xsl:with-param name="type" select="@storageType" /></xsl:call-template>
            </xsl:for-each>
            <xsl:for-each select="Relation">, p<xsl:value-of select="substring(@name, 1)"/> BIGINT
            </xsl:for-each>
        )
        RETURNS BIGINT 
        READS SQL DATA
        BEGIN
            DECLARE id BIGINT;
            INSERT INTO `<xsl:value-of select="@name" />` 
            (
                <xsl:for-each select="Property"><xsl:if test="position() != 1">, </xsl:if>`<xsl:value-of select="@name"/>`</xsl:for-each>
                <xsl:for-each select="Relation">,`<xsl:value-of select="substring(@name, 1)"/>`</xsl:for-each>
            ) VALUES (
                <xsl:for-each select="Property"><xsl:if test="position() != 1">, </xsl:if>p<xsl:value-of select="@name"/></xsl:for-each>
                <xsl:for-each select="Relation">, p<xsl:value-of select="substring(@name, 1)"/></xsl:for-each>
            );
            
            SET id := LAST_INSERT_ID();
            RETURN id;
        END
        $$
    </xsl:template>
    <xsl:template name="tpl-detail-procedures">

        CREATE PROCEDURE sp<xsl:value-of select="@name"/>Details
        (
            pId BIGINT
        )
        READS SQL DATA
        BEGIN
            SELECT '<xsl:value-of select="@name"/>' AS `NEXT_RECORDSET`;
        
            SELECT
                <xsl:for-each select="Property"><xsl:if test="position() != 1">,</xsl:if>`<xsl:value-of select="@name"/>`</xsl:for-each>
            FROM `<xsl:value-of select="@name"/>`
            WHERE _id = pId;

<xsl:for-each select="Relation"> 
            SELECT '<xsl:value-of select="@name"/>:<xsl:value-of select="@toEntity"/>' AS `NEXT_RECORDSET`;
                
    <xsl:choose>
        <xsl:when test="@type='hasOne'">
            SELECT R.* 
            FROM `<xsl:value-of select="../@name" />` T
            INNER JOIN `<xsl:value-of select="@toEntity"/>` R ON R._id = T._<xsl:value-of select="@name"/>
            WHERE T._id = pId;
        </xsl:when>
        <xsl:when test="@type='hasMany'">
            SELECT R.*
            FROM `<xsl:value-of select="../@name"/>` T
            INNER JOIN `<xsl:value-of select="../@name"/>_has_<xsl:value-of select="@name"/>` L ON L.parent_id = T._id 
            INNER JOIN `<xsl:value-of select="@toEntity"/>` R ON R._id = L.child_id
            WHERE T._id = pId
            ORDER BY L.sequence ASC;
        </xsl:when>
    </xsl:choose>
</xsl:for-each>
        
            SELECT 'RECORD_META' AS `NEXT_RECORDSET`;
    
            SELECT
                 T._created       AS `DateCreated`
                ,T._modified      AS `DateLastModified`
                ,T._creator       AS `AuthorMemberId`
                ,AP.DisplayName   AS `AuthorName`
                ,T._modifier      AS `EditorMemberId`
                ,EP.DisplayName   AS `EditorName`
            FROM `<xsl:value-of select="@name"/>` T
            LEFT JOIN `Member` A ON A._id = T._creator
                LEFT JOIN `Person` AP ON AP._id = A._Person
            LEFT JOIN `Member` E ON E._id = T._modifier
                LEFT JOIN `Person` EP ON EP._id = A._Person
            WHERE T._id = pId;
        
        END;
        $$

    </xsl:template>
</xsl:stylesheet>
